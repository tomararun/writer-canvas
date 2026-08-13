import { createFileRoute, Link } from "@tanstack/react-router";
import { PostCard } from "@/components/PostCard";
import { formatDate, site } from "@/content/site";
import { useContent } from "@/lib/content";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Maya Ellsworth — Writer on craft, attention & systems" },
      {
        name: "description",
        content:
          "Essays, case studies, and a public learning journal from Maya Ellsworth, a writer working on craft, attention, and the systems we build to think.",
      },
      { property: "og:title", content: "Maya Ellsworth — Writer on craft, attention & systems" },
      {
        property: "og:description",
        content: "Essays, case studies, and a public learning journal on craft and attention.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Person",
          name: site.name,
          jobTitle: "Writer",
          email: `mailto:${site.email}`,
          url: "/",
        }),
      },
    ],
  }),
  component: Home,
});

function Home() {
  const { posts, caseStudies, journal } = useContent();
  const featured = posts.filter((p) => p.featured);
  const featuredStudies = caseStudies.filter((c) => c.featured);
  const latestJournal = journal.slice(0, 3);

  return (
    <>
      <section className="border-b border-rule bg-paper">
        <div className="wrap grid gap-12 py-20 md:grid-cols-[1.4fr_1fr] md:py-32">
          <div>
            <p className="eyebrow">Writer · Editor · {site.location}</p>
            <h1 className="mt-6 max-w-[15ch] font-display text-5xl leading-[1.05] sm:text-6xl md:text-7xl">
              I write about the quiet work behind good thinking.
            </h1>
            <p className="mt-8 max-w-xl text-lg leading-relaxed text-muted-foreground">
              {site.tagline} Fifteen years of essays, editorial systems, and notebooks — published
              here in the open, revisions and all.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                to="/writing"
                className="bg-primary px-6 py-3 text-sm text-primary-foreground transition-opacity hover:opacity-90"
              >
                Read the writing
              </Link>
              <Link to="/about" className="border border-foreground/25 px-6 py-3 text-sm transition-colors hover:border-primary">
                About me
              </Link>
            </div>
          </div>

          <aside className="self-end border-l border-rule pl-6 md:pl-10">
            <p className="eyebrow">Currently</p>
            <ul className="mt-4 grid gap-4 text-sm leading-relaxed">
              <li>
                <span className="text-muted-foreground">Writing</span>
                <br />A long essay on attention as a craft skill.
              </li>
              <li>
                <span className="text-muted-foreground">Learning</span>
                <br />Typography, interviewing, and just enough SQL.
              </li>
              <li>
                <span className="text-muted-foreground">Reading</span>
                <br />Ways of Seeing, again, slower this time.
              </li>
            </ul>
          </aside>
        </div>
      </section>

      <section aria-labelledby="featured-writing" className="wrap py-20 md:py-28">
        <div className="mb-10 flex items-baseline justify-between gap-6">
          <h2 id="featured-writing" className="font-display text-3xl sm:text-4xl">Featured writing</h2>
          <Link to="/writing" className="link-underline shrink-0 text-sm">All essays</Link>
        </div>
        <div className="grid gap-12">
          {featured.map((p, i) => (
            <PostCard key={p.slug} post={p} large={i === 0} />
          ))}
        </div>
      </section>

      <section aria-labelledby="featured-cases" className="border-y border-rule bg-paper">
        <div className="wrap py-20 md:py-28">
          <div className="mb-10 flex items-baseline justify-between gap-6">
            <h2 id="featured-cases" className="font-display text-3xl sm:text-4xl">Selected case studies</h2>
            <Link to="/case-studies" className="link-underline shrink-0 text-sm">All work</Link>
          </div>
          <div className="grid gap-10 md:grid-cols-2">
            {featuredStudies.map((c) => (
              <article key={c.slug} className="border-t border-rule pt-6">
                <p className="text-xs text-muted-foreground">{c.client} · {c.year}</p>
                <h3 className="mt-3 font-display text-2xl leading-tight">
                  <Link to="/case-studies/$slug" params={{ slug: c.slug }} className="hover:text-primary">
                    {c.title}
                  </Link>
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{c.summary}</p>
                <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-rule pt-4">
                  {c.metrics.slice(0, 2).map((m) => (
                    <div key={m.label}>
                      <dt className="text-xs text-muted-foreground">{m.label}</dt>
                      <dd className="font-display text-xl">{m.value}</dd>
                    </div>
                  ))}
                </dl>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="current-learning" className="wrap py-20 md:py-28">
        <div className="mb-10 flex items-baseline justify-between gap-6">
          <h2 id="current-learning" className="font-display text-3xl sm:text-4xl">What I'm learning</h2>
          <Link to="/journal" className="link-underline shrink-0 text-sm">The journal</Link>
        </div>
        <ul className="grid gap-px bg-rule md:grid-cols-3">
          {latestJournal.map((j) => (
            <li key={j.slug} className="bg-background p-6">
              <p className="eyebrow">{j.topic}</p>
              <h3 className="mt-3 font-display text-xl leading-snug">
                <Link to="/journal/$slug" params={{ slug: j.slug }} className="hover:text-primary">
                  {j.title}
                </Link>
              </h3>
              <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                {j.reflection[0]}
              </p>
              <time className="mt-4 block text-xs text-muted-foreground" dateTime={j.date}>
                {formatDate(j.date)}
              </time>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
