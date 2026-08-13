import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";

import { PageHeader } from "@/components/PageHeader";
import { Prose } from "@/components/Prose";
import {
  claimAdminSeat,
  deleteContactMessage,
  deleteRecord,
  deleteSubscriber,
  getAdminStatus,
  getTrafficSummary,
  listAllRecords,
  listAuditLog,
  listContactMessages,
  listRevisions,
  listSubscribers,
  restoreRevision,
  saveRecord,
  setContactMessageRead,
  setWorkflowState,
  type ContentRow,
  type ContentTable,
} from "@/lib/admin.functions";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Studio — Write, edit and publish" },
      {
        name: "description",
        content: "Private editing studio for essays, case studies, journal entries and projects.",
      },
      { property: "og:title", content: "Studio — Write, edit and publish" },
      { property: "og:description", content: "Private editing studio." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

type FieldKind = "text" | "area" | "markdown" | "list" | "json" | "number" | "bool" | "date";
type Field = { name: string; label: string; kind: FieldKind };

type Tab = {
  table: ContentTable;
  label: string;
  fields: Field[];
  workflow: boolean;
  previewType?: "post" | "case-study" | "journal";
};

const TABS: Tab[] = [
  {
    table: "posts",
    label: "Essays",
    workflow: true,
    previewType: "post",
    fields: [
      { name: "slug", label: "Slug", kind: "text" },
      { name: "title", label: "Title", kind: "text" },
      { name: "dek", label: "Dek", kind: "area" },
      { name: "date", label: "Date", kind: "date" },
      { name: "category", label: "Category", kind: "text" },
      { name: "tags", label: "Tags (one per line)", kind: "list" },
      { name: "reading_time", label: "Reading time (min)", kind: "number" },
      { name: "featured", label: "Featured", kind: "bool" },
      { name: "body_md", label: "Body (markdown)", kind: "markdown" },
    ],
  },
  {
    table: "case_studies",
    label: "Case studies",
    workflow: true,
    previewType: "case-study",
    fields: [
      { name: "slug", label: "Slug", kind: "text" },
      { name: "title", label: "Title", kind: "text" },
      { name: "summary", label: "Summary", kind: "area" },
      { name: "client", label: "Client", kind: "text" },
      { name: "year", label: "Year", kind: "text" },
      { name: "role", label: "Role", kind: "text" },
      { name: "tags", label: "Tags (one per line)", kind: "list" },
      { name: "featured", label: "Featured", kind: "bool" },
      { name: "background", label: "Background", kind: "area" },
      { name: "problem", label: "Problem", kind: "area" },
      { name: "process", label: "Process — JSON [{step, detail}]", kind: "json" },
      { name: "implementation", label: "Implementation (one per line)", kind: "list" },
      { name: "outcomes", label: "Outcomes", kind: "area" },
      { name: "metrics", label: "Metrics — JSON [{label, value}]", kind: "json" },
      { name: "learnings", label: "Learnings (one per line)", kind: "list" },
      { name: "gallery", label: "Gallery — JSON [{caption, tone}]", kind: "json" },
    ],
  },
  {
    table: "journal_entries",
    label: "Journal",
    workflow: true,
    previewType: "journal",
    fields: [
      { name: "slug", label: "Slug", kind: "text" },
      { name: "title", label: "Title", kind: "text" },
      { name: "date", label: "Date", kind: "date" },
      { name: "topic", label: "Topic", kind: "text" },
      { name: "reflection_md", label: "Reflection (markdown)", kind: "markdown" },
      { name: "resources", label: "Resources — JSON [{label, href}]", kind: "json" },
    ],
  },
  {
    table: "projects",
    label: "Projects",
    workflow: false,
    fields: [
      { name: "slug", label: "Slug", kind: "text" },
      { name: "name", label: "Name", kind: "text" },
      { name: "blurb", label: "Blurb", kind: "area" },
      { name: "year", label: "Year", kind: "text" },
      { name: "status", label: "Status (Live / In progress / Archived)", kind: "text" },
      { name: "link", label: "Link", kind: "text" },
      { name: "case_study", label: "Case study slug", kind: "text" },
    ],
  },
];

const STATUS_LABEL: Record<string, string> = {
  draft: "Draft",
  review: "In review",
  scheduled: "Scheduled",
  published: "Published",
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

function toInput(kind: FieldKind, value: unknown): string {
  if (value == null) return "";
  if (kind === "list") return Array.isArray(value) ? value.join("\n") : "";
  if (kind === "json") return JSON.stringify(value ?? [], null, 2);
  return String(value);
}

function fromInput(kind: FieldKind, raw: string): unknown {
  switch (kind) {
    case "list":
      return raw
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);
    case "json":
      return raw.trim() ? JSON.parse(raw) : [];
    case "number":
      return Number(raw) || 0;
    case "bool":
      return raw === "true";
    default:
      return raw;
  }
}

function emptyRow(fields: Field[]): Record<string, string> {
  return Object.fromEntries(
    fields.map((f) => [f.name, f.kind === "bool" ? "false" : f.kind === "json" ? "[]" : ""]),
  );
}

function AdminPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const status = useQuery({ queryKey: ["admin-status"], queryFn: () => getAdminStatus() });
  const claim = useServerFn(claimAdminSeat);

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    await navigate({ to: "/auth", replace: true });
  }

  if (status.isLoading) {
    return <div className="wrap py-24 text-sm text-muted-foreground">Loading studio…</div>;
  }

  if (!status.data?.isAdmin) {
    return (
      <>
        <PageHeader eyebrow="Studio" title="This studio has one seat." />
        <div className="wrap py-16">
          {status.data?.adminSeatTaken ? (
            <p className="max-w-lg text-sm leading-relaxed">
              The admin seat is already claimed by another account. Sign out and use the studio
              account instead.
            </p>
          ) : (
            <>
              <p className="max-w-lg text-sm leading-relaxed">
                No admin has been set up yet. Claim the seat with this account to start publishing.
              </p>
              <button
                className="mt-6 bg-primary px-5 py-2.5 text-sm text-primary-foreground"
                onClick={async () => {
                  await claim();
                  await status.refetch();
                }}
              >
                Claim the admin seat
              </button>
            </>
          )}
          <button onClick={signOut} className="mt-8 block link-underline text-sm">
            Sign out
          </button>
        </div>
      </>
    );
  }

  return <Studio onSignOut={signOut} />;
}

function Studio({ onSignOut }: { onSignOut: () => void }) {
  const [tabIndex, setTabIndex] = useState(0);
  const extraTabs = ["Media", "Messages", "Subscribers", "Traffic", "Activity"];
  const tab = TABS[tabIndex];

  return (
    <>
      <PageHeader eyebrow="Studio" title="Write, edit, publish." />
      <div className="wrap py-12 md:py-16">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-rule pb-4">
          <nav className="flex flex-wrap gap-4 text-sm">
            {TABS.map((t, i) => (
              <button
                key={t.table}
                onClick={() => setTabIndex(i)}
                className={
                  i === tabIndex ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }
              >
                {t.label}
              </button>
            ))}
            {extraTabs.map((label, i) => (
              <button
                key={label}
                onClick={() => setTabIndex(TABS.length + i)}
                className={
                  tabIndex === TABS.length + i
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }
              >
                {label}
              </button>
            ))}
          </nav>
          <button onClick={onSignOut} className="link-underline text-sm">
            Sign out
          </button>
        </div>

        {tabIndex === TABS.length ? (
          <MediaLibrary />
        ) : tabIndex === TABS.length + 1 ? (
          <MessageInbox />
        ) : tabIndex === TABS.length + 2 ? (
          <SubscriberList />
        ) : tabIndex === TABS.length + 3 ? (
          <TrafficReport />
        ) : tabIndex === TABS.length + 4 ? (
          <ActivityLog />
        ) : tab ? (
          <TableEditor key={tab.table} tab={tab} />
        ) : null}
      </div>
    </>
  );
}

function TableEditor({ tab }: { tab: Tab }) {
  const { table, fields, workflow, previewType } = tab;
  const queryClient = useQueryClient();
  const list = useQuery({
    queryKey: ["admin-records", table],
    queryFn: () => listAllRecords({ data: { table } }),
  });
  const [openSlug, setOpenSlug] = useState<string | null>(null);
  const [draft, setDraft] = useState<Record<string, string> | null>(null);
  const [error, setError] = useState("");

  async function refresh() {
    await queryClient.invalidateQueries({ queryKey: ["admin-records", table] });
    await queryClient.invalidateQueries({ queryKey: ["site-content"] });
    await queryClient.invalidateQueries({ queryKey: ["audit-log"] });
  }

  const save = useMutation({
    mutationFn: async (values: Record<string, unknown>) => saveRecord({ data: { table, values } }),
    onSuccess: async () => {
      setError("");
      await refresh();
      await queryClient.invalidateQueries({ queryKey: ["revisions", table] });
    },
    onError: (e) => setError(e instanceof Error ? e.message : "Could not save."),
  });

  const remove = useMutation({
    mutationFn: async (slug: string) => deleteRecord({ data: { table, slug } }),
    onSuccess: async () => {
      setDraft(null);
      setOpenSlug(null);
      await refresh();
    },
  });

  const rows = list.data ?? [];
  const openRow = rows.find((r) => String(r["slug"]) === openSlug) ?? null;

  function edit(row: ContentRow) {
    setOpenSlug(String(row["slug"]));
    setDraft(
      Object.fromEntries(fields.map((f) => [f.name, toInput(f.kind, row[f.name])])) as Record<
        string,
        string
      >,
    );
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!draft) return;
    try {
      const values: Record<string, unknown> = {};
      for (const f of fields) values[f.name] = fromInput(f.kind, draft[f.name] ?? "");
      if (workflow && !openRow) {
        values["status"] = "draft";
        values["published"] = false;
      }
      save.mutate(values);
      setOpenSlug(String(values["slug"]));
    } catch {
      setError("One of the JSON fields is not valid JSON.");
    }
  }

  return (
    <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_1.4fr]">
      <section>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl">Entries</h2>
          <button
            className="text-sm text-primary"
            onClick={() => {
              setOpenSlug(null);
              setDraft(emptyRow(fields));
            }}
          >
            + New
          </button>
        </div>
        {list.isLoading && <p className="mt-6 text-sm text-muted-foreground">Loading…</p>}
        <ul className="mt-6 grid gap-px bg-rule">
          {rows.map((row) => {
            const slug = String(row["slug"]);
            const status = String(
              row["status"] ?? (row["published"] === false ? "draft" : "published"),
            );
            return (
              <li key={slug} className="flex items-center justify-between gap-4 bg-paper py-3">
                <div>
                  <p className="text-sm">{String(row["title"] ?? row["name"] ?? slug)}</p>
                  <p className="text-xs text-muted-foreground">
                    {slug}
                    {workflow ? ` · ${STATUS_LABEL[status] ?? status}` : ""}
                    {row["scheduled_for"]
                      ? ` · ${new Date(String(row["scheduled_for"])).toLocaleString()}`
                      : ""}
                  </p>
                </div>
                <div className="flex shrink-0 gap-3 text-xs">
                  <button className="link-underline" onClick={() => edit(row)}>
                    Edit
                  </button>
                  <button
                    className="link-underline text-destructive"
                    onClick={() => {
                      if (confirm(`Delete “${slug}”?`)) remove.mutate(slug);
                    }}
                  >
                    Delete
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <section>
        <h2 className="font-display text-2xl">{draft ? "Editor" : "Nothing open"}</h2>
        {!draft && (
          <p className="mt-4 text-sm text-muted-foreground">
            Pick an entry to edit, or start a new one.
          </p>
        )}

        {draft && workflow && openRow && previewType && (
          <WorkflowBar table={table} row={openRow} previewType={previewType} onChanged={refresh} />
        )}

        {draft && (
          <form onSubmit={submit} className="mt-6 grid gap-6">
            {fields.map((f) => (
              <div key={f.name}>
                <div className="flex items-baseline justify-between gap-4">
                  <label htmlFor={f.name} className="eyebrow">
                    {f.label}
                  </label>
                  {f.name === "slug" && (
                    <button
                      type="button"
                      className="link-underline text-xs"
                      onClick={() =>
                        setDraft({
                          ...draft,
                          slug: slugify(draft["title"] ?? draft["name"] ?? draft["slug"] ?? ""),
                        })
                      }
                    >
                      Generate from title
                    </button>
                  )}
                </div>

                {f.kind === "markdown" ? (
                  <MarkdownField
                    id={f.name}
                    value={draft[f.name] ?? ""}
                    onChange={(v) => setDraft({ ...draft, [f.name]: v })}
                  />
                ) : f.kind === "bool" ? (
                  <select
                    id={f.name}
                    value={draft[f.name]}
                    onChange={(e) => setDraft({ ...draft, [f.name]: e.target.value })}
                    className="mt-2 block border-b border-foreground/30 bg-transparent py-2 text-sm outline-none"
                  >
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                ) : f.kind === "area" || f.kind === "list" || f.kind === "json" ? (
                  <textarea
                    id={f.name}
                    rows={f.kind === "area" ? 3 : 6}
                    value={draft[f.name]}
                    onChange={(e) => setDraft({ ...draft, [f.name]: e.target.value })}
                    className="mt-2 w-full border border-rule bg-transparent p-3 text-sm outline-none focus:border-primary"
                  />
                ) : (
                  <input
                    id={f.name}
                    type={f.kind === "date" ? "date" : f.kind === "number" ? "number" : "text"}
                    value={draft[f.name]}
                    onChange={(e) => setDraft({ ...draft, [f.name]: e.target.value })}
                    className="mt-2 w-full border-b border-foreground/30 bg-transparent py-2 text-sm outline-none focus:border-primary"
                  />
                )}
              </div>
            ))}

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex flex-wrap items-center gap-4">
              <button
                type="submit"
                disabled={save.isPending}
                className="bg-primary px-5 py-2.5 text-sm text-primary-foreground disabled:opacity-50"
              >
                {save.isPending ? "Saving…" : "Save"}
              </button>
              <button
                type="button"
                className="link-underline text-sm"
                onClick={() => {
                  setDraft(null);
                  setOpenSlug(null);
                }}
              >
                Close
              </button>
              {save.isSuccess && !save.isPending && (
                <span className="text-xs text-muted-foreground">Saved.</span>
              )}
            </div>
          </form>
        )}

        {draft && openSlug && <RevisionList table={table} slug={openSlug} onRestored={refresh} />}
      </section>
    </div>
  );
}

function MarkdownField({
  id,
  value,
  onChange,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const [showPreview, setShowPreview] = useState(true);
  return (
    <div className="mt-2">
      <button
        type="button"
        className="link-underline mb-2 text-xs"
        onClick={() => setShowPreview((s) => !s)}
      >
        {showPreview ? "Hide preview" : "Show preview"}
      </button>
      <div className={showPreview ? "grid gap-4 md:grid-cols-2" : ""}>
        <textarea
          id={id}
          rows={18}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={
            "## A heading\n\nWrite in markdown. **Bold**, _italic_, [links](https://…), lists and quotes all work."
          }
          className="w-full border border-rule bg-transparent p-3 font-mono text-xs leading-relaxed outline-none focus:border-primary"
        />
        {showPreview && (
          <div className="max-h-[28rem] overflow-auto border border-rule p-4">
            {value.trim() ? (
              <Prose markdown={value} />
            ) : (
              <p className="text-xs text-muted-foreground">Preview appears as you type.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function WorkflowBar({
  table,
  row,
  previewType,
  onChanged,
}: {
  table: ContentTable;
  row: ContentRow;
  previewType: "post" | "case-study" | "journal";
  onChanged: () => Promise<void>;
}) {
  const slug = String(row["slug"]);
  const status = String(row["status"] ?? "draft");
  const [when, setWhen] = useState("");
  const [message, setMessage] = useState("");

  const act = useMutation({
    mutationFn: async (input: {
      action: "draft" | "review" | "schedule" | "publish" | "unpublish";
      scheduledFor?: string;
    }) =>
      setWorkflowState({
        data: {
          table: table as "posts" | "case_studies" | "journal_entries",
          slug,
          action: input.action,
          ...(input.scheduledFor ? { scheduledFor: input.scheduledFor } : {}),
        },
      }),
    onSuccess: async () => {
      setMessage("");
      await onChanged();
    },
    onError: (e) => setMessage(e instanceof Error ? e.message : "Could not update state."),
  });

  const previewUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/preview/${previewType}/${slug}?token=${String(row["preview_token"] ?? "")}`
      : "";

  return (
    <div className="mt-6 border border-rule p-4">
      <div className="flex flex-wrap items-center gap-3 text-xs">
        <span className="eyebrow">{STATUS_LABEL[status] ?? status}</span>
        {row["published_at"] && (
          <span className="text-muted-foreground">
            published {new Date(String(row["published_at"])).toLocaleDateString()}
          </span>
        )}
        {row["scheduled_for"] && (
          <span className="text-muted-foreground">
            scheduled {new Date(String(row["scheduled_for"])).toLocaleString()}
          </span>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-3 text-sm">
        <button
          className="bg-primary px-4 py-2 text-xs text-primary-foreground disabled:opacity-50"
          disabled={act.isPending || status === "published"}
          onClick={() => act.mutate({ action: "publish" })}
        >
          Publish now
        </button>
        <button
          className="border border-rule px-4 py-2 text-xs"
          disabled={act.isPending || status === "review"}
          onClick={() => act.mutate({ action: "review" })}
        >
          Move to review
        </button>
        <button
          className="border border-rule px-4 py-2 text-xs"
          disabled={act.isPending || status === "draft"}
          onClick={() => act.mutate({ action: status === "published" ? "unpublish" : "draft" })}
        >
          {status === "published" ? "Unpublish" : "Back to draft"}
        </button>
      </div>

      <div className="mt-4 flex flex-wrap items-end gap-3">
        <div>
          <label htmlFor="schedule-at" className="eyebrow">
            Schedule for
          </label>
          <input
            id="schedule-at"
            type="datetime-local"
            value={when}
            onChange={(e) => setWhen(e.target.value)}
            className="mt-2 block border-b border-foreground/30 bg-transparent py-1.5 text-sm outline-none"
          />
        </div>
        <button
          className="border border-rule px-4 py-2 text-xs disabled:opacity-50"
          disabled={!when || act.isPending}
          onClick={() =>
            act.mutate({ action: "schedule", scheduledFor: new Date(when).toISOString() })
          }
        >
          Schedule
        </button>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs">
        <a href={previewUrl} target="_blank" rel="noreferrer" className="link-underline">
          Open private preview
        </a>
        <button
          className="link-underline"
          onClick={() => navigator.clipboard?.writeText(previewUrl)}
        >
          Copy preview link
        </button>
      </div>

      {message && <p className="mt-3 text-xs text-destructive">{message}</p>}
    </div>
  );
}

function RevisionList({
  table,
  slug,
  onRestored,
}: {
  table: ContentTable;
  slug: string;
  onRestored: () => Promise<void>;
}) {
  const queryClient = useQueryClient();
  const revisions = useQuery({
    queryKey: ["revisions", table, slug],
    queryFn: () => listRevisions({ data: { table, slug } }),
  });

  const restore = useMutation({
    mutationFn: async (id: string) => restoreRevision({ data: { id } }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["revisions", table, slug] });
      await onRestored();
    },
  });

  return (
    <section className="mt-12 border-t border-rule pt-6">
      <h3 className="font-display text-xl">Revision history</h3>
      {revisions.isLoading && <p className="mt-3 text-sm text-muted-foreground">Loading…</p>}
      {revisions.data?.length === 0 && (
        <p className="mt-3 text-sm text-muted-foreground">No saved versions yet.</p>
      )}
      <ul className="mt-4 grid gap-px bg-rule">
        {(revisions.data ?? []).map((rev) => (
          <li
            key={rev.id}
            className="flex items-center justify-between gap-4 bg-paper py-3 text-sm"
          >
            <div>
              <p>{rev.note || "Snapshot"}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(rev.created_at).toLocaleString()}
                {rev.created_by_email ? ` · ${rev.created_by_email}` : ""}
              </p>
            </div>
            <button
              className="link-underline text-xs"
              disabled={restore.isPending}
              onClick={() => {
                if (confirm("Restore this version? The current one is snapshotted first."))
                  restore.mutate(rev.id);
              }}
            >
              Restore
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

function TrafficReport() {
  const traffic = useQuery({ queryKey: ["traffic"], queryFn: () => getTrafficSummary() });
  const data = traffic.data;
  const maxDay = Math.max(1, ...(data?.byDay ?? []).map((d) => d.views));

  return (
    <section className="mt-10">
      <h2 className="font-display text-2xl">Traffic — last 30 days</h2>
      {traffic.isLoading && <p className="mt-4 text-sm text-muted-foreground">Loading…</p>}
      {traffic.isError && (
        <p className="mt-4 text-sm text-muted-foreground">
          No traffic data yet. Views are recorded once the page_views migration is applied.
        </p>
      )}

      {data && (
        <>
          <p className="mt-4 text-sm">
            <span className="font-display text-3xl">{data.total.toLocaleString()}</span>{" "}
            <span className="text-muted-foreground">page views</span>
          </p>

          <div className="mt-10 grid gap-12 lg:grid-cols-2">
            <div>
              <h3 className="eyebrow">By day</h3>
              <ul className="mt-4 grid gap-1">
                {data.byDay.map((d) => (
                  <li key={d.day} className="flex items-center gap-3 text-xs">
                    <span className="w-20 shrink-0 text-muted-foreground">{d.day.slice(5)}</span>
                    <span
                      className="h-3 bg-primary/70"
                      style={{ width: `${Math.max(2, (d.views / maxDay) * 100)}%` }}
                    />
                    <span>{d.views}</span>
                  </li>
                ))}
                {data.byDay.length === 0 && (
                  <li className="text-sm text-muted-foreground">No views recorded yet.</li>
                )}
              </ul>
            </div>

            <div>
              <h3 className="eyebrow">Top pages</h3>
              <ul className="mt-4 grid gap-px bg-rule">
                {data.byPath.map((p) => (
                  <li
                    key={p.path}
                    className="flex items-baseline justify-between gap-4 bg-paper py-2 text-sm"
                  >
                    <span className="truncate" title={p.path}>
                      {p.path}
                    </span>
                    <span className="shrink-0 text-muted-foreground">{p.views}</span>
                  </li>
                ))}
                {data.byPath.length === 0 && (
                  <li className="bg-paper py-2 text-sm text-muted-foreground">Nothing yet.</li>
                )}
              </ul>
            </div>
          </div>
        </>
      )}
    </section>
  );
}

function ActivityLog() {
  const log = useQuery({ queryKey: ["audit-log"], queryFn: () => listAuditLog() });

  return (
    <section className="mt-10">
      <h2 className="font-display text-2xl">Activity</h2>
      {log.isLoading && <p className="mt-4 text-sm text-muted-foreground">Loading…</p>}
      <ul className="mt-6 grid gap-px bg-rule">
        {(log.data ?? []).map((entry) => (
          <li
            key={entry.id}
            className="flex flex-wrap items-baseline justify-between gap-3 bg-paper py-3 text-sm"
          >
            <span>
              <span className="text-primary">{entry.action}</span> · {entry.table_name} ·{" "}
              {entry.slug}
            </span>
            <span className="text-xs text-muted-foreground">
              {entry.actor_email} · {new Date(entry.created_at).toLocaleString()}
            </span>
          </li>
        ))}
      </ul>
      {log.data?.length === 0 && (
        <p className="mt-6 text-sm text-muted-foreground">Nothing logged yet.</p>
      )}
    </section>
  );
}

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

function MediaLibrary() {
  const queryClient = useQueryClient();
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");

  const list = useQuery({
    queryKey: ["media"],
    queryFn: async () => {
      const { data, error: listError } = await supabase.storage.from("media").list("", {
        limit: 200,
        sortBy: { column: "created_at", order: "desc" },
      });
      if (listError) throw new Error(listError.message);
      return (data ?? []).filter((f) => f.name !== ".emptyFolderPlaceholder");
    },
  });

  const upload = useMutation({
    mutationFn: async (file: File) => {
      if (!file.type.startsWith("image/")) throw new Error("Only image files are supported.");
      if (file.size > MAX_UPLOAD_BYTES) throw new Error("Keep images under 5 MB.");
      const safeName = file.name
        .toLowerCase()
        .replace(/[^\w.-]+/g, "-")
        .replace(/-+/g, "-");
      const { error: upError } = await supabase.storage
        .from("media")
        .upload(`${Date.now()}-${safeName}`, file, { cacheControl: "31536000" });
      if (upError) throw new Error(upError.message);
    },
    onSuccess: async () => {
      setError("");
      await queryClient.invalidateQueries({ queryKey: ["media"] });
    },
    onError: (e) => setError(e instanceof Error ? e.message : "Upload failed."),
  });

  const remove = useMutation({
    mutationFn: async (name: string) => {
      const { error: rmError } = await supabase.storage.from("media").remove([name]);
      if (rmError) throw new Error(rmError.message);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["media"] }),
  });

  function publicUrl(name: string) {
    return supabase.storage.from("media").getPublicUrl(name).data.publicUrl;
  }

  async function copy(text: string, name: string) {
    await navigator.clipboard?.writeText(text);
    setCopied(name);
    setTimeout(() => setCopied(""), 2000);
  }

  return (
    <section className="mt-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="font-display text-2xl">Media {list.data ? `(${list.data.length})` : ""}</h2>
        <label className="cursor-pointer bg-primary px-4 py-2 text-xs text-primary-foreground">
          {upload.isPending ? "Uploading…" : "Upload image"}
          <input
            type="file"
            accept="image/*"
            className="sr-only"
            disabled={upload.isPending}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) upload.mutate(file);
              e.target.value = "";
            }}
          />
        </label>
      </div>
      <p className="mt-3 text-sm text-muted-foreground">
        Paste the copied markdown into any body field to place an image. Files are public once
        uploaded.
      </p>
      {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
      {list.isLoading && <p className="mt-6 text-sm text-muted-foreground">Loading…</p>}

      <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {(list.data ?? []).map((f) => {
          const url = publicUrl(f.name);
          return (
            <li key={f.name} className="border border-rule">
              <img
                src={url}
                alt=""
                loading="lazy"
                className="aspect-[4/3] w-full bg-rule object-cover"
              />
              <div className="p-3">
                <p className="truncate text-xs text-muted-foreground" title={f.name}>
                  {f.name}
                </p>
                <div className="mt-2 flex flex-wrap gap-3 text-xs">
                  <button className="link-underline" onClick={() => copy(url, f.name)}>
                    {copied === f.name ? "Copied!" : "Copy URL"}
                  </button>
                  <button
                    className="link-underline"
                    onClick={() => copy(`![](${url})`, `md-${f.name}`)}
                  >
                    {copied === `md-${f.name}` ? "Copied!" : "Copy markdown"}
                  </button>
                  <button
                    className="link-underline text-destructive"
                    disabled={remove.isPending}
                    onClick={() => {
                      if (confirm(`Delete ${f.name}? Pages using it will show a broken image.`))
                        remove.mutate(f.name);
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
      {list.data?.length === 0 && (
        <p className="mt-6 text-sm text-muted-foreground">No images yet.</p>
      )}
    </section>
  );
}

function MessageInbox() {
  const queryClient = useQueryClient();
  const list = useQuery({ queryKey: ["contact-messages"], queryFn: () => listContactMessages() });

  const setRead = useMutation({
    mutationFn: async (input: { id: string; read: boolean }) =>
      setContactMessageRead({ data: input }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["contact-messages"] }),
  });
  const remove = useMutation({
    mutationFn: async (id: string) => deleteContactMessage({ data: { id } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["contact-messages"] }),
  });

  const messages = list.data ?? [];
  const unread = messages.filter((m) => !m.read).length;

  return (
    <section className="mt-10">
      <h2 className="font-display text-2xl">
        Messages {list.data ? `(${messages.length}${unread ? `, ${unread} unread` : ""})` : ""}
      </h2>
      {list.isLoading && <p className="mt-4 text-sm text-muted-foreground">Loading…</p>}
      <ul className="mt-6 grid gap-px bg-rule">
        {messages.map((m) => (
          <li key={m.id} className={`bg-paper py-4 ${m.read ? "opacity-70" : ""}`}>
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <p className="text-sm">
                {!m.read && (
                  <span className="mr-2 text-primary" aria-label="Unread">
                    ●
                  </span>
                )}
                {m.name} ·{" "}
                <a href={`mailto:${m.email}`} className="link-underline">
                  {m.email}
                </a>
                {m.subject ? ` · ${m.subject}` : ""}
              </p>
              <span className="text-xs text-muted-foreground">
                {new Date(m.created_at).toLocaleString()}
              </span>
            </div>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed">{m.message}</p>
            <div className="mt-3 flex gap-4 text-xs">
              <button
                className="link-underline"
                disabled={setRead.isPending}
                onClick={() => setRead.mutate({ id: m.id, read: !m.read })}
              >
                {m.read ? "Mark unread" : "Mark read"}
              </button>
              <button
                className="link-underline text-destructive"
                disabled={remove.isPending}
                onClick={() => {
                  if (confirm(`Delete the message from ${m.name}?`)) remove.mutate(m.id);
                }}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
      {list.data?.length === 0 && (
        <p className="mt-6 text-sm text-muted-foreground">No messages yet.</p>
      )}
    </section>
  );
}

function SubscriberList() {
  const queryClient = useQueryClient();
  const list = useQuery({ queryKey: ["subscribers"], queryFn: () => listSubscribers() });
  const remove = useMutation({
    mutationFn: async (id: string) => deleteSubscriber({ data: { id } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["subscribers"] }),
  });

  return (
    <section className="mt-10">
      <h2 className="font-display text-2xl">
        Newsletter subscribers {list.data ? `(${list.data.length})` : ""}
      </h2>
      <ul className="mt-6 grid gap-px bg-rule">
        {(list.data ?? []).map((s) => (
          <li key={s.id} className="flex items-center justify-between bg-paper py-3 text-sm">
            <span>{s.email}</span>
            <button
              className="link-underline text-xs text-destructive"
              onClick={() => remove.mutate(s.id)}
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
      {list.data?.length === 0 && (
        <p className="mt-6 text-sm text-muted-foreground">No subscribers yet.</p>
      )}
    </section>
  );
}
