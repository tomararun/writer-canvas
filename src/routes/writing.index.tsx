import { useContent } from "@/lib/content";
import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { PostCard } from "@/components/PostCard";


export const Route = createFileRoute("/writing/")({
  validateSearch: (search: Record<string, unknown>): { category?: string; tag?: string } => ({
    ...(typeof search["category"] === "string" && search["category"]
      ? { category: search["category"] }
      : {}),
    ...(typeof search["tag"] === "string" && search["tag"] ? { tag: search["tag"] } : {}),
  }),
  head: () => ({
    meta: [
      { title: "Writing — Essays, tutorials & reflections" },
      {
        name: "description",
        content:
          "Every essay, tutorial, reflection, and opinion, browsable by category and tag. Long-form writing on craft, attention, and systems.",
      },
      { property: "og:title", content: "Writing — Essays, tutorials & reflections" },
      { property: "og:description", content: "Browse essays by category and tag." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/writing" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/writing" }],
  }),
  component: WritingIndex,
});

function WritingIndex() {
  const { posts } = useContent();
  const { category = "", tag = "" } = Route.useSearch();
  const categories = Array.from(new Set(posts.map((p) => p.category)));
  const tags = Array.from(new Set(posts.flatMap((p) => p.tags)));

  const filtered = posts.filter(
    (p) => (!category || p.category === category) && (!tag || p.tags.includes(tag)),
  );

  return (
    <>
      <PageHeader
        eyebrow="Writing"
        title="Essays, tutorials, reflections, opinions."
        intro="Longer pieces, published slowly. Filter by category or tag — or read the archive if you would rather see everything at once."
      />

      <div className="wrap grid gap-12 py-16 md:grid-cols-[1fr_3fr] md:py-24">
        <aside aria-label="Filters" className="md:sticky md:top-24 md:self-start">
          <h2 className="eyebrow">Categories</h2>
          <ul className="mt-4 grid gap-2 text-sm">
            <li>
              <Link to="/writing" search={{ category: "", tag }} className={!category ? "text-primary" : "link-underline"}>
                All
              </Link>
            </li>
            {categories.map((c) => (
              <li key={c}>
                <Link
                  to="/writing"
                  search={{ category: c, tag }}
                  className={category === c ? "text-primary" : "link-underline"}
                >
                  {c}
                </Link>
              </li>
            ))}
          </ul>

          <h2 className="eyebrow mt-10">Tags</h2>
          <ul className="mt-4 flex flex-wrap gap-2 text-xs">
            {tags.map((t) => (
              <li key={t}>
                <Link
                  to="/writing"
                  search={{ category, tag: tag === t ? "" : t }}
                  className={`border px-2 py-1 ${tag === t ? "border-primary text-primary" : "border-rule text-muted-foreground"}`}
                >
                  #{t}
                </Link>
              </li>
            ))}
          </ul>
        </aside>

        <section aria-label="Posts" className="grid gap-12">
          <p className="text-sm text-muted-foreground">
            {filtered.length} {filtered.length === 1 ? "piece" : "pieces"}
          </p>
          {filtered.map((p) => (
            <PostCard key={p.slug} post={p} />
          ))}
          {filtered.length === 0 && (
            <p className="text-sm text-muted-foreground">Nothing here yet with that combination.</p>
          )}
        </section>
      </div>
    </>
  );
}
