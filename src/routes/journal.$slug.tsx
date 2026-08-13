import { Prose } from "@/components/Prose";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { formatDate, site } from "@/content/site";
import { contentQueryOptions } from "@/lib/content";

export const Route = createFileRoute("/journal/$slug")({
  loader: async ({ params, context }) => {
    const content = await context.queryClient.ensureQueryData(contentQueryOptions);
    const entry = content.journal.find((x) => x.slug === params.slug);
    if (!entry) throw notFound();
    return { entry, all: content.journal };
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) {
      return { meta: [{ title: "Not found" }, { name: "robots", content: "noindex" }] };
    }
    const { entry } = loaderData;
    const desc = entry.reflection[0] ?? entry.topic;
    return {
      meta: [
        { title: `${entry.title} — Learning journal` },
        { name: "description", content: desc },
        { property: "og:title", content: entry.title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "article" },
        { property: "og:url", content: `/journal/${params.slug}` },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: `/journal/${params.slug}` }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: entry.title,
            datePublished: entry.date,
            author: { "@type": "Person", name: site.name },
          }),
        },
      ],
    };
  },
  component: JournalEntry,
});

function JournalEntry() {
  const { entry, all } = Route.useLoaderData();
  const related = all.filter((j: typeof entry) => j.slug !== entry.slug).slice(0, 2);

  return (
    <article>
      <header className="border-b border-rule bg-paper">
        <div className="wrap py-16 md:py-24">
          <nav aria-label="Breadcrumb" className="text-xs text-muted-foreground">
            <Link to="/journal" className="link-underline">Journal</Link>
            <span aria-hidden> / </span>
            <span>{entry.topic}</span>
          </nav>
          <h1 className="mt-6 max-w-3xl font-display text-4xl leading-[1.1] sm:text-5xl">
            {entry.title}
          </h1>
          <p className="mt-6 text-sm text-muted-foreground">
            <time dateTime={entry.date}>{formatDate(entry.date)}</time> · {entry.topic}
          </p>
        </div>
      </header>

      <div className="wrap grid gap-12 py-16 md:grid-cols-[3fr_1fr] md:py-24">
        <section aria-label="Reflection" className="prose-editorial">
          {entry.reflectionMd?.trim() ? (
            <Prose markdown={entry.reflectionMd} className="" />
          ) : (
            entry.reflection.map((p: string, i: number) => <p key={i}>{p}</p>)
          )}
        </section>

        <aside>
          <h2 className="eyebrow">Resources</h2>
          {entry.resources.length > 0 ? (
            <ul className="mt-4 grid gap-3 text-sm">
              {entry.resources.map((r: { label: string; href: string }) => (
                <li key={r.label}>
                  <a href={r.href} className="link-underline">{r.label}</a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">No links this week — just practice.</p>
          )}
        </aside>
      </div>

      <section aria-labelledby="related-entries" className="border-t border-rule bg-paper">
        <div className="wrap py-16">
          <h2 id="related-entries" className="font-display text-2xl">Related entries</h2>
          <ul className="mt-8 grid gap-px bg-rule sm:grid-cols-2">
            {related.map((r: typeof entry) => (
              <li key={r.slug} className="bg-paper p-6">
                <p className="eyebrow">{r.topic}</p>
                <h3 className="mt-2 font-display text-lg">
                  <Link to="/journal/$slug" params={{ slug: r.slug }} className="hover:text-primary">
                    {r.title}
                  </Link>
                </h3>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </article>
  );
}
