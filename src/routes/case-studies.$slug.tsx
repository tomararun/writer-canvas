import { absoluteUrl, canonical } from "@/lib/seo";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { site } from "@/content/site";
import { contentQueryOptions } from "@/lib/content";

export const Route = createFileRoute("/case-studies/$slug")({
  loader: async ({ params, context }) => {
    const content = await context.queryClient.ensureQueryData(contentQueryOptions);
    const study = content.caseStudies.find((x) => x.slug === params.slug);
    if (!study) throw notFound();
    return { study, all: content.caseStudies };
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) {
      return { meta: [{ title: "Not found" }, { name: "robots", content: "noindex" }] };
    }
    const { study } = loaderData;
    return {
      meta: [
        { title: `${study.title} — Case study` },
        { name: "description", content: study.summary },
        { property: "og:title", content: study.title },
        { property: "og:description", content: study.summary },
        { property: "og:type", content: "article" },
        { property: "og:url", content: absoluteUrl(`/case-studies/${params.slug}`) },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [canonical(`/case-studies/${params.slug}`)],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CreativeWork",
            name: study.title,
            about: study.client,
            description: study.summary,
            author: { "@type": "Person", name: site.name },
          }),
        },
      ],
    };
  },
  component: CaseStudyPage,
});

const toneClass: Record<string, string> = {
  warm: "bg-[oklch(0.9_0.05_60)]",
  cool: "bg-[oklch(0.9_0.04_220)]",
  sand: "bg-[oklch(0.92_0.04_100)]",
};

function CaseStudyPage() {
  const { study } = Route.useLoaderData();

  return (
    <article>
      <header className="border-b border-rule bg-paper">
        <div className="wrap py-16 md:py-24">
          <nav aria-label="Breadcrumb" className="text-xs text-muted-foreground">
            <Link to="/case-studies" className="link-underline">
              Case studies
            </Link>
            <span aria-hidden> / </span>
            <span>{study.client}</span>
          </nav>
          <h1 className="mt-6 max-w-3xl font-display text-4xl leading-[1.1] sm:text-5xl md:text-6xl">
            {study.title}
          </h1>
          <dl className="mt-10 grid gap-6 border-t border-rule pt-6 sm:grid-cols-3">
            <div>
              <dt className="eyebrow">Client</dt>
              <dd className="mt-1">{study.client}</dd>
            </div>
            <div>
              <dt className="eyebrow">Role</dt>
              <dd className="mt-1">{study.role}</dd>
            </div>
            <div>
              <dt className="eyebrow">Year</dt>
              <dd className="mt-1">{study.year}</dd>
            </div>
          </dl>
        </div>
      </header>

      <div className="wrap grid gap-16 py-16 md:py-24">
        <section aria-labelledby="background" className="grid gap-6 md:grid-cols-[1fr_2fr]">
          <h2 id="background" className="font-display text-2xl">
            Background
          </h2>
          <p className="max-w-2xl text-lg leading-relaxed">{study.background}</p>
        </section>

        <section aria-labelledby="problem" className="grid gap-6 md:grid-cols-[1fr_2fr]">
          <h2 id="problem" className="font-display text-2xl">
            The problem
          </h2>
          <p className="max-w-2xl text-lg leading-relaxed">{study.problem}</p>
        </section>

        <section aria-labelledby="process" className="grid gap-6 md:grid-cols-[1fr_2fr]">
          <h2 id="process" className="font-display text-2xl">
            Process
          </h2>
          <ol className="grid gap-6">
            {study.process.map((s: { step: string; detail: string }, i: number) => (
              <li
                key={s.step}
                className="grid grid-cols-[2rem_1fr] gap-4 border-b border-rule pb-6"
              >
                <span className="font-display text-primary">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <h3 className="font-display text-lg">{s.step}</h3>
                  <p className="mt-1 leading-relaxed text-muted-foreground">{s.detail}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="implementation" className="grid gap-6 md:grid-cols-[1fr_2fr]">
          <h2 id="implementation" className="font-display text-2xl">
            Implementation
          </h2>
          <ul className="grid gap-4">
            {study.implementation.map((s: string) => (
              <li key={s} className="border-l-2 border-primary pl-4 leading-relaxed">
                {s}
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="gallery">
          <h2 id="gallery" className="font-display text-2xl">
            Gallery
          </h2>
          <ul className="mt-8 grid gap-6 sm:grid-cols-3">
            {study.gallery.map((g: { caption: string; tone: string }) => (
              <li key={g.caption}>
                <div
                  role="img"
                  aria-label={`${g.caption} — process artefact from ${study.client}`}
                  className={`aspect-[4/3] w-full border border-rule ${toneClass[g.tone] ?? "bg-muted"}`}
                />
                <p className="mt-2 text-xs text-muted-foreground">{g.caption}</p>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="outcomes" className="border-y border-rule bg-paper p-8 md:p-12">
          <h2 id="outcomes" className="font-display text-2xl">
            Outcomes
          </h2>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed">{study.outcomes}</p>
          <dl className="mt-10 grid grid-cols-2 gap-8 md:grid-cols-4">
            {study.metrics.map((m: { label: string; value: string }) => (
              <div key={m.label}>
                <dt className="text-xs text-muted-foreground">{m.label}</dt>
                <dd className="mt-1 font-display text-2xl">{m.value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section aria-labelledby="learnings" className="grid gap-6 md:grid-cols-[1fr_2fr]">
          <h2 id="learnings" className="font-display text-2xl">
            What I learned
          </h2>
          <ul className="grid gap-4">
            {study.learnings.map((l: string) => (
              <li key={l} className="border-b border-rule pb-4 text-lg leading-relaxed">
                {l}
              </li>
            ))}
          </ul>
        </section>

        <p>
          <Link to="/case-studies" className="link-underline text-sm">
            ← All case studies
          </Link>
        </p>
      </div>
    </article>
  );
}
