import { useContent } from "@/lib/content";
import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";


export const Route = createFileRoute("/case-studies/")({
  head: () => ({
    meta: [
      { title: "Case studies — Editorial systems & content architecture" },
      {
        name: "description",
        content:
          "Deep process breakdowns of editorial and content architecture work: background, problem, role, process, implementation, outcomes, and metrics.",
      },
      { property: "og:title", content: "Case studies — Editorial systems & content architecture" },
      { property: "og:description", content: "Deep process breakdowns of editorial work." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/case-studies" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/case-studies" }],
  }),
  component: CaseStudiesIndex,
});

function CaseStudiesIndex() {
  const { caseStudies } = useContent();
  return (
    <>
      <PageHeader
        eyebrow="Case studies"
        title="The work, with the messy middle left in."
        intro="Editorial systems, voice guides, and information architecture. Each study covers the background, the problem, my role, the process, what shipped, and what it changed."
      />

      <div className="wrap py-16 md:py-24">
        <ul className="grid gap-16">
          {caseStudies.map((c) => (
            <li key={c.slug}>
              <article className="grid gap-8 border-t border-rule pt-8 md:grid-cols-[1fr_2fr]">
                <div>
                  <p className="eyebrow">{c.year}</p>
                  <p className="mt-2 text-sm text-muted-foreground">{c.client}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{c.role}</p>
                </div>
                <div>
                  <h2 className="font-display text-3xl leading-tight sm:text-4xl">
                    <Link to="/case-studies/$slug" params={{ slug: c.slug }} className="hover:text-primary">
                      {c.title}
                    </Link>
                  </h2>
                  <p className="mt-4 max-w-2xl leading-relaxed text-muted-foreground">{c.summary}</p>
                  <dl className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-4">
                    {c.metrics.map((m) => (
                      <div key={m.label}>
                        <dt className="text-xs text-muted-foreground">{m.label}</dt>
                        <dd className="mt-1 font-display text-lg">{m.value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
