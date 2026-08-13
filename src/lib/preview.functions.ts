import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { mapCaseStudy, mapJournal, mapPost } from "./content-map";
import type { CaseStudy, Journal, Post } from "@/content/site";

const TABLES = {
  post: "posts",
  "case-study": "case_studies",
  journal: "journal_entries",
} as const;

export type PreviewType = keyof typeof TABLES;

export type PreviewResult =
  | { ok: false }
  | {
      ok: true;
      type: PreviewType;
      status: string;
      scheduledFor: string | null;
      post?: Post;
      caseStudy?: CaseStudy;
      journal?: Journal;
    };

/**
 * Reads one entry by slug AND its secret preview token, regardless of publish state.
 * The token acts as the credential — no token, no row.
 */
export const getPreview = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        type: z.enum(["post", "case-study", "journal"]),
        slug: z.string().min(1).max(200),
        token: z.string().uuid(),
      })
      .parse(input),
  )
  .handler(async ({ data }): Promise<PreviewResult> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const table = TABLES[data.type];
    const { data: row } = await supabaseAdmin
      .from(table)
      .select("*")
      .eq("slug", data.slug)
      .eq("preview_token", data.token)
      .maybeSingle();

    if (!row) return { ok: false };
    const record = row as Record<string, unknown>;
    const base = {
      ok: true as const,
      type: data.type,
      status: typeof record["status"] === "string" ? record["status"] : "draft",
      scheduledFor:
        typeof record["scheduled_for"] === "string" ? record["scheduled_for"] : null,
    };

    if (data.type === "post") return { ...base, post: mapPost(record) };
    if (data.type === "case-study") return { ...base, caseStudy: mapCaseStudy(record) };
    return { ...base, journal: mapJournal(record) };
  });
