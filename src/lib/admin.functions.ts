import { createServerFn } from "@tanstack/react-start";
import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { markdownToParagraphs } from "@/lib/markdown";

const tableSchema = z.enum(["posts", "case_studies", "journal_entries", "projects"]);
export type ContentTable = z.infer<typeof tableSchema>;

export const WORKFLOW_TABLES: ContentTable[] = ["posts", "case_studies", "journal_entries"];

type Json = string | number | boolean | null | Json[] | { [key: string]: Json };
export type ContentRow = Record<string, Json>;

export type Revision = {
  id: string;
  slug: string;
  table_name: string;
  note: string;
  created_at: string;
  created_by_email: string;
  snapshot: ContentRow;
};

export type AuditEntry = {
  id: string;
  table_name: string;
  slug: string;
  action: string;
  details: Record<string, Json>;
  actor_email: string;
  created_at: string;
};

type Ctx = { supabase: unknown; userId: string; claims: Record<string, unknown> };

function untyped(context: Ctx): SupabaseClient {
  return context.supabase as SupabaseClient;
}

function actorEmail(context: Ctx): string {
  const email = context.claims?.["email"];
  return typeof email === "string" ? email : "";
}

async function assertAdmin(context: Ctx) {
  const db = untyped(context);
  const { data, error } = await db.rpc("has_role", { _user_id: context.userId, _role: "admin" });
  if (error || data !== true) throw new Error("Forbidden");
  return db;
}

async function log(
  db: SupabaseClient,
  context: Ctx,
  table: ContentTable,
  slug: string,
  action: string,
  details: Record<string, Json> = {},
) {
  await db.from("content_audit_log").insert({
    table_name: table,
    slug,
    action,
    details,
    actor_id: context.userId,
    actor_email: actorEmail(context),
  });
}

async function snapshot(
  db: SupabaseClient,
  context: Ctx,
  table: ContentTable,
  slug: string,
  note: string,
) {
  const { data } = await db.from(table).select("*").eq("slug", slug).maybeSingle();
  if (!data) return false;
  await db.from("content_revisions").insert({
    table_name: table,
    slug,
    snapshot: data,
    note,
    created_by: context.userId,
    created_by_email: actorEmail(context),
  });
  return true;
}

export const getAdminStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const ctx = context as unknown as Ctx;
    const db = untyped(ctx);
    const { data } = await db.rpc("has_role", { _user_id: ctx.userId, _role: "admin" });
    const { count } = await db
      .from("user_roles")
      .select("*", { count: "exact", head: true })
      .eq("role", "admin");
    return { isAdmin: data === true, adminSeatTaken: (count ?? 0) > 0 };
  });

export const claimAdminSeat = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const db = untyped(context as unknown as Ctx);
    const { data, error } = await db.rpc("claim_admin");
    if (error) throw new Error(error.message);
    return { isAdmin: data === true };
  });

export const listAllRecords = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ table: tableSchema }).parse(input))
  .handler(async ({ data, context }) => {
    const db = await assertAdmin(context as unknown as Ctx);
    const { data: rows, error } = await db.from(data.table).select("*").order("slug");
    if (error) throw new Error(error.message);
    return (rows ?? []) as ContentRow[];
  });

/** Keep derived plain-text fields in step with the markdown source. */
function withDerivedFields(table: ContentTable, values: Record<string, unknown>) {
  const next = { ...values };
  if (table === "posts" && typeof next["body_md"] === "string" && next["body_md"].trim()) {
    next["body"] = markdownToParagraphs(next["body_md"]);
  }
  if (
    table === "journal_entries" &&
    typeof next["reflection_md"] === "string" &&
    next["reflection_md"].trim()
  ) {
    next["reflection"] = markdownToParagraphs(next["reflection_md"]);
  }
  return next;
}

export const saveRecord = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        table: tableSchema,
        values: z.record(z.string(), z.any()),
      })
      .parse(input),
  )
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    const ctx = context as unknown as Ctx;
    const db = await assertAdmin(ctx);
    const slug = (data.values as ContentRow)["slug"];
    if (typeof slug !== "string" || !slug.trim()) throw new Error("A slug is required.");

    const existed = await snapshot(db, ctx, data.table, slug, "Before save");
    const values = withDerivedFields(data.table, data.values);
    const { error } = await db.from(data.table).upsert(values, { onConflict: "slug" });
    if (error) throw new Error(error.message);
    await log(db, ctx, data.table, slug, existed ? "updated" : "created");
    return { ok: true };
  });

export const deleteRecord = createServerFn({ method: "POST" })
  .inputValidator((input) => z.object({ table: tableSchema, slug: z.string() }).parse(input))
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    const ctx = context as unknown as Ctx;
    const db = await assertAdmin(ctx);
    await snapshot(db, ctx, data.table, data.slug, "Before delete");
    const { error } = await db.from(data.table).delete().eq("slug", data.slug);
    if (error) throw new Error(error.message);
    await log(db, ctx, data.table, data.slug, "deleted");
    return { ok: true };
  });

const workflowSchema = z.object({
  table: z.enum(["posts", "case_studies", "journal_entries"]),
  slug: z.string().min(1),
  action: z.enum(["draft", "review", "schedule", "publish", "unpublish"]),
  scheduledFor: z.string().datetime().optional(),
});

export const setWorkflowState = createServerFn({ method: "POST" })
  .inputValidator((input) => workflowSchema.parse(input))
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    const ctx = context as unknown as Ctx;
    const db = await assertAdmin(ctx);

    let patch: Record<string, unknown>;
    switch (data.action) {
      case "publish":
        patch = {
          status: "published",
          published: true,
          published_at: new Date().toISOString(),
          scheduled_for: null,
        };
        break;
      case "unpublish":
        patch = { status: "draft", published: false, scheduled_for: null };
        break;
      case "schedule": {
        if (!data.scheduledFor) throw new Error("Pick a date and time to schedule.");
        const when = new Date(data.scheduledFor);
        if (Number.isNaN(when.getTime()) || when.getTime() <= Date.now()) {
          throw new Error("Scheduled time must be in the future.");
        }
        patch = {
          status: "scheduled",
          published: false,
          scheduled_for: when.toISOString(),
        };
        break;
      }
      case "review":
        patch = { status: "review", published: false, scheduled_for: null };
        break;
      default:
        patch = { status: "draft", published: false, scheduled_for: null };
    }

    const { error } = await db.from(data.table).update(patch).eq("slug", data.slug);
    if (error) throw new Error(error.message);
    await log(db, ctx, data.table, data.slug, data.action, {
      scheduledFor: data.scheduledFor ?? null,
    });
    return { ok: true };
  });

export const listRevisions = createServerFn({ method: "POST" })
  .inputValidator((input) => z.object({ table: tableSchema, slug: z.string() }).parse(input))
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    const db = await assertAdmin(context as unknown as Ctx);
    const { data: rows, error } = await db
      .from("content_revisions")
      .select("id, table_name, slug, note, created_at, created_by_email, snapshot")
      .eq("table_name", data.table)
      .eq("slug", data.slug)
      .order("created_at", { ascending: false })
      .limit(25);
    if (error) throw new Error(error.message);
    return (rows ?? []) as Revision[];
  });

export const restoreRevision = createServerFn({ method: "POST" })
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    const ctx = context as unknown as Ctx;
    const db = await assertAdmin(ctx);
    const { data: rev, error } = await db
      .from("content_revisions")
      .select("table_name, slug, snapshot")
      .eq("id", data.id)
      .maybeSingle();
    if (error || !rev) throw new Error("That revision no longer exists.");

    const table = rev.table_name as ContentTable;
    await snapshot(db, ctx, table, rev.slug as string, "Before restore");
    const values = { ...(rev.snapshot as Record<string, unknown>) };
    delete values["created_at"];
    delete values["updated_at"];
    const { error: upErr } = await db.from(table).upsert(values, { onConflict: "slug" });
    if (upErr) throw new Error(upErr.message);
    await log(db, ctx, table, rev.slug as string, "restored", { revisionId: data.id });
    return { ok: true };
  });

export const listAuditLog = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const db = await assertAdmin(context as unknown as Ctx);
    const { data, error } = await db
      .from("content_audit_log")
      .select("id, table_name, slug, action, details, actor_email, created_at")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw new Error(error.message);
    return (data ?? []) as AuditEntry[];
  });

export type TrafficSummary = {
  total: number;
  byPath: { path: string; views: number }[];
  byDay: { day: string; views: number }[];
};

export const getTrafficSummary = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const db = await assertAdmin(context as unknown as Ctx);
    const { data, error } = await db.rpc("page_view_summary", { _days: 30 });
    if (error) throw new Error(error.message);
    return (data ?? { total: 0, byPath: [], byDay: [] }) as TrafficSummary;
  });

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  created_at: string;
};

export const listContactMessages = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const db = await assertAdmin(context as unknown as Ctx);
    const { data, error } = await db
      .from("contact_messages")
      .select("id, name, email, subject, message, read, created_at")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    return (data ?? []) as ContactMessage[];
  });

export const setContactMessageRead = createServerFn({ method: "POST" })
  .inputValidator((input) => z.object({ id: z.string().uuid(), read: z.boolean() }).parse(input))
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    const db = await assertAdmin(context as unknown as Ctx);
    const { error } = await db
      .from("contact_messages")
      .update({ read: data.read })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteContactMessage = createServerFn({ method: "POST" })
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    const db = await assertAdmin(context as unknown as Ctx);
    const { error } = await db.from("contact_messages").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listSubscribers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const db = await assertAdmin(context as unknown as Ctx);
    const { data, error } = await db
      .from("subscribers")
      .select("id, email, created_at")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as { id: string; email: string; created_at: string }[];
  });

export const deleteSubscriber = createServerFn({ method: "POST" })
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    const db = await assertAdmin(context as unknown as Ctx);
    const { error } = await db.from("subscribers").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
