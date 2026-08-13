import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { useContent } from "@/lib/content";
import type { SiteContent } from "@/lib/content-map";

type Result = { title: string; excerpt: string; type: string; to: string; params: { slug: string } };

export const Route = createFileRoute("/search")({
  validateSearch: (search: Record<string, unknown>): { q?: string } =>
    typeof search["q"] === "string" && search["q"] ? { q: search["q"] } : {},
  head: () => ({
    meta: [
      { title: "Search — Find an essay, case study, or journal entry" },
      {
        name: "description",
        content: "Search across every essay, case study, and learning journal entry on the site.",
      },
      { property: "og:title", content: "Search the site" },
      { property: "og:description", content: "Find an essay, case study, or journal entry." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/search" },
      { name: "robots", content: "noindex" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/search" }],
  }),
  component: Search,
});

function searchAll(q: string, { posts, caseStudies, journal }: SiteContent): Result[] {
  const needle = q.trim().toLowerCase();
  if (!needle) return [];
  const results: Result[] = [];

  posts.forEach((p) => {
    if ([p.title, p.dek, p.category, ...p.tags, ...p.body].join(" ").toLowerCase().includes(needle))
      results.push({ title: p.title, excerpt: p.dek, type: "Essay", to: "/writing/$slug", params: { slug: p.slug } });
  });
  caseStudies.forEach((c) => {
    if ([c.title, c.summary, c.client, ...c.tags].join(" ").toLowerCase().includes(needle))
      results.push({ title: c.title, excerpt: c.summary, type: "Case study", to: "/case-studies/$slug", params: { slug: c.slug } });
  });
  journal.forEach((j) => {
    if ([j.title, j.topic, ...j.reflection].join(" ").toLowerCase().includes(needle))
      results.push({ title: j.title, excerpt: j.reflection[0] ?? "", type: "Journal", to: "/journal/$slug", params: { slug: j.slug } });
  });

  return results;
}

function Search() {
  const { q = "" } = Route.useSearch();
  const navigate = useNavigate({ from: "/search" });
  const content = useContent();
  const results = searchAll(q, content);

  return (
    <>
      <PageHeader eyebrow="Search" title="Find something." />

      <div className="wrap py-16 md:py-24">
        <form
          role="search"
          className="flex max-w-xl gap-3 border-b border-foreground/30 pb-2"
          onSubmit={(e) => {
            e.preventDefault();
            const value = new FormData(e.currentTarget).get("q");
            navigate({ search: { q: typeof value === "string" ? value : "" } });
          }}
        >
          <label htmlFor="q" className="sr-only">Search essays, case studies and journal entries</label>
          <input
            id="q"
            name="q"
            defaultValue={q}
            placeholder="Try “structure”, “typography”, “archive”…"
            className="w-full bg-transparent py-2 text-lg outline-none placeholder:text-muted-foreground"
          />
          <button type="submit" className="shrink-0 text-sm text-primary">Search</button>
        </form>

        <p className="mt-8 text-sm text-muted-foreground" role="status" aria-live="polite">
          {q ? `${results.length} result${results.length === 1 ? "" : "s"} for “${q}”` : "Enter a term to search."}
        </p>

        <ul className="mt-8 grid gap-8">
          {results.map((r) => (
            <li key={`${r.type}-${r.params.slug}`} className="border-t border-rule pt-5">
              <p className="eyebrow">{r.type}</p>
              <h2 className="mt-2 font-display text-2xl">
                <Link to={r.to} params={r.params} className="hover:text-primary">{r.title}</Link>
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">{r.excerpt}</p>
            </li>
          ))}
        </ul>

        {q && results.length === 0 && (
          <p className="mt-8 text-sm">
            Nothing matched. Try the <Link to="/archive" className="link-underline">archive</Link> instead.
          </p>
        )}
      </div>
    </>
  );
}
