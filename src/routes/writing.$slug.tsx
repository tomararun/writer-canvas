import { absoluteUrl, canonical } from "@/lib/seo";
import { Prose } from "@/components/Prose";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { formatDate, site } from "@/content/site";
import { contentQueryOptions } from "@/lib/content";
import { NewsletterSignup } from "@/components/NewsletterSignup";

export const Route = createFileRoute("/writing/$slug")({
  loader: async ({ params, context }) => {
    const content = await context.queryClient.ensureQueryData(contentQueryOptions);
    const post = content.posts.find((x) => x.slug === params.slug);
    if (!post) throw notFound();
    return { post, all: content.posts };
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) {
      return { meta: [{ title: "Not found" }, { name: "robots", content: "noindex" }] };
    }
    const { post } = loaderData;
    return {
      meta: [
        { title: `${post.title} — ${site.name}` },
        { name: "description", content: post.dek },
        { property: "og:title", content: post.title },
        { property: "og:description", content: post.dek },
        { property: "og:type", content: "article" },
        { property: "og:url", content: absoluteUrl(`/writing/${params.slug}`) },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [canonical(`/writing/${params.slug}`)],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: post.title,
            description: post.dek,
            datePublished: post.date,
            keywords: post.tags.join(", "),
            author: { "@type": "Person", name: site.name },
          }),
        },
      ],
    };
  },
  component: PostPage,
});

function PostPage() {
  const { post, all } = Route.useLoaderData();
  const related = all
    .filter(
      (p: typeof post) => p.slug !== post.slug && p.tags.some((t: string) => post.tags.includes(t)),
    )
    .slice(0, 3);

  return (
    <article>
      <header className="border-b border-rule bg-paper">
        <div className="wrap py-16 md:py-24">
          <nav aria-label="Breadcrumb" className="text-xs text-muted-foreground">
            <Link to="/writing" className="link-underline">
              Writing
            </Link>
            <span aria-hidden> / </span>
            <span>{post.category}</span>
          </nav>
          <h1 className="mt-6 max-w-3xl font-display text-4xl leading-[1.1] sm:text-5xl md:text-6xl">
            {post.title}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">{post.dek}</p>
          <div className="mt-8 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <time dateTime={post.date}>{formatDate(post.date)}</time>
            <span aria-hidden>·</span>
            <span>{post.readingTime} min read</span>
            <span aria-hidden>·</span>
            <span>{site.name}</span>
          </div>
        </div>
      </header>

      <div className="wrap grid gap-12 py-16 md:grid-cols-[3fr_1fr] md:py-24">
        <div className="prose-editorial">
          {post.bodyMd?.trim() ? (
            <Prose markdown={post.bodyMd} className="" />
          ) : (
            post.body.map((p: string, i: number) => (
              <p
                key={i}
                className={
                  i === 0
                    ? "first-letter:float-left first-letter:mr-3 first-letter:font-display first-letter:text-6xl first-letter:leading-[0.8]"
                    : ""
                }
              >
                {p}
              </p>
            ))
          )}

          <ul className="mt-12 flex flex-wrap gap-2 border-t border-rule pt-6">
            {post.tags.map((t: string) => (
              <li key={t}>
                <Link
                  to="/writing"
                  search={{ category: "", tag: t }}
                  className="border border-rule px-2 py-1 text-xs text-muted-foreground hover:border-primary hover:text-primary"
                >
                  #{t}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <aside className="md:sticky md:top-24 md:self-start">
          <h2 className="eyebrow">Share</h2>
          <ul className="mt-4 grid gap-2 text-sm">
            <li>
              <a
                className="link-underline"
                href={`https://bsky.app/intent/compose?text=${encodeURIComponent(post.title)}`}
              >
                Bluesky
              </a>
            </li>
            <li>
              <a
                className="link-underline"
                href={`https://www.linkedin.com/sharing/share-offsite/?url=/writing/${post.slug}`}
              >
                LinkedIn
              </a>
            </li>
            <li>
              <a
                className="link-underline"
                href={`mailto:?subject=${encodeURIComponent(post.title)}`}
              >
                Email a friend
              </a>
            </li>
          </ul>
        </aside>
      </div>

      {related.length > 0 && (
        <section aria-labelledby="related" className="border-t border-rule bg-paper">
          <div className="wrap py-16 md:py-20">
            <h2 id="related" className="font-display text-2xl">
              Related reading
            </h2>
            <ul className="mt-8 grid gap-px bg-rule md:grid-cols-3">
              {related.map((r: typeof post) => (
                <li key={r.slug} className="bg-paper p-6">
                  <p className="eyebrow">{r.category}</p>
                  <h3 className="mt-2 font-display text-lg leading-snug">
                    <Link
                      to="/writing/$slug"
                      params={{ slug: r.slug }}
                      className="hover:text-primary"
                    >
                      {r.title}
                    </Link>
                  </h3>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <div className="wrap py-16">
        <NewsletterSignup />
      </div>
    </article>
  );
}
