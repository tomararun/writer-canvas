import { absoluteUrl, canonical } from "@/lib/seo";
import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { formatDate, type CaseStudy, type Journal, type Post } from "@/content/site";
import { useContent } from "@/lib/content";

type Item = {
  slug: string;
  title: string;
  date: string;
  type: "Essay" | "Case study" | "Journal";
  category: string;
  tags: string[];
};

function buildItems(posts: Post[], caseStudies: CaseStudy[], journal: Journal[]): Item[] {
  return [
    ...posts.map((p) => ({
      slug: p.slug,
      title: p.title,
      date: p.date,
      type: "Essay" as const,
      category: p.category,
      tags: p.tags,
    })),
    ...caseStudies.map((c) => ({
      slug: c.slug,
      title: c.title,
      date: `${c.year}-01-01`,
      type: "Case study" as const,
      category: "Work",
      tags: c.tags,
    })),
    ...journal.map((j) => ({
      slug: j.slug,
      title: j.title,
      date: j.date,
      type: "Journal" as const,
      category: j.topic,
      tags: [j.topic.toLowerCase()],
    })),
  ].sort((a, b) => (a.date < b.date ? 1 : -1));
}

const types = ["Essay", "Case study", "Journal"] as const;

export const Route = createFileRoute("/archive")({
  validateSearch: (
    search: Record<string, unknown>,
  ): { type?: string; tag?: string; year?: string } => ({
    ...(typeof search["type"] === "string" && search["type"] ? { type: search["type"] } : {}),
    ...(typeof search["tag"] === "string" && search["tag"] ? { tag: search["tag"] } : {}),
    ...(typeof search["year"] === "string" && search["year"] ? { year: search["year"] } : {}),
  }),
  head: () => ({
    meta: [
      { title: "Archive — Everything published, by date" },
      {
        name: "description",
        content:
          "The complete archive of essays, case studies, and journal entries, filterable by type, category, tag, and year.",
      },
      { property: "og:title", content: "Archive — Everything published, by date" },
      { property: "og:description", content: "Every piece, filterable by type, tag, and year." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: absoluteUrl("/archive") },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [canonical("/archive")],
  }),
  component: Archive,
});

function itemLink(item: Item) {
  if (item.type === "Essay") return { to: "/writing/$slug" as const, params: { slug: item.slug } };
  if (item.type === "Case study")
    return { to: "/case-studies/$slug" as const, params: { slug: item.slug } };
  return { to: "/journal/$slug" as const, params: { slug: item.slug } };
}

function Archive() {
  const { posts, caseStudies, journal } = useContent();
  const items = buildItems(posts, caseStudies, journal);
  const { type = "", tag = "", year = "" } = Route.useSearch();
  const years = Array.from(new Set(items.map((i) => i.date.slice(0, 4))));
  const tags = Array.from(new Set(items.flatMap((i) => i.tags)));

  const filtered = items.filter(
    (i) =>
      (!type || i.type === type) &&
      (!tag || i.tags.includes(tag)) &&
      (!year || i.date.startsWith(year)),
  );

  return (
    <>
      <PageHeader
        eyebrow="Archive"
        title="Everything, in reverse order."
        intro="The full record — essays, case studies, and journal entries together. Filter it down, or scroll."
      />

      <div className="wrap py-16 md:py-24">
        <div className="grid gap-6 border-b border-rule pb-8 sm:grid-cols-3">
          <fieldset>
            <legend className="eyebrow mb-3">Type</legend>
            <ul className="flex flex-wrap gap-2 text-xs">
              <li>
                <Link
                  to="/archive"
                  search={{ type: "", tag, year }}
                  className={`border px-2 py-1 ${!type ? "border-primary text-primary" : "border-rule"}`}
                >
                  All
                </Link>
              </li>
              {types.map((t) => (
                <li key={t}>
                  <Link
                    to="/archive"
                    search={{ type: t, tag, year }}
                    className={`border px-2 py-1 ${type === t ? "border-primary text-primary" : "border-rule"}`}
                  >
                    {t}
                  </Link>
                </li>
              ))}
            </ul>
          </fieldset>

          <fieldset>
            <legend className="eyebrow mb-3">Year</legend>
            <ul className="flex flex-wrap gap-2 text-xs">
              <li>
                <Link
                  to="/archive"
                  search={{ type, tag, year: "" }}
                  className={`border px-2 py-1 ${!year ? "border-primary text-primary" : "border-rule"}`}
                >
                  All
                </Link>
              </li>
              {years.map((y) => (
                <li key={y}>
                  <Link
                    to="/archive"
                    search={{ type, tag, year: y }}
                    className={`border px-2 py-1 ${year === y ? "border-primary text-primary" : "border-rule"}`}
                  >
                    {y}
                  </Link>
                </li>
              ))}
            </ul>
          </fieldset>

          <fieldset>
            <legend className="eyebrow mb-3">Tag</legend>
            <ul className="flex flex-wrap gap-2 text-xs">
              {tags.map((t) => (
                <li key={t}>
                  <Link
                    to="/archive"
                    search={{ type, tag: tag === t ? "" : t, year }}
                    className={`border px-2 py-1 ${tag === t ? "border-primary text-primary" : "border-rule"}`}
                  >
                    #{t}
                  </Link>
                </li>
              ))}
            </ul>
          </fieldset>
        </div>

        <p className="mt-8 text-sm text-muted-foreground" role="status">
          {filtered.length} {filtered.length === 1 ? "entry" : "entries"}
        </p>

        <ul className="mt-6">
          {filtered.map((i) => {
            const link = itemLink(i);
            return (
              <li
                key={`${i.type}-${i.slug}`}
                className="grid gap-2 border-b border-rule py-5 sm:grid-cols-[8rem_1fr_8rem] sm:items-baseline"
              >
                <time className="text-xs text-muted-foreground" dateTime={i.date}>
                  {formatDate(i.date)}
                </time>
                <Link {...link} className="font-display text-lg hover:text-primary">
                  {i.title}
                </Link>
                <span className="text-xs text-muted-foreground sm:text-right">{i.type}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
}
