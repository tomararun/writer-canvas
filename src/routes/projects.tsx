import { useContent } from "@/lib/content";
import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";


export const Route = createFileRoute("/projects")({
  head: () => ({
    meta: [
      { title: "Projects — Newsletters, tools & editorial systems" },
      {
        name: "description",
        content:
          "An index of things I have made: a weekly newsletter, editorial systems for publications, and a small tool for keeping quotes and sources.",
      },
      { property: "og:title", content: "Projects — Newsletters, tools & editorial systems" },
      { property: "og:description", content: "An index of things I have made." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/projects" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/projects" }],
  }),
  component: Projects,
});

function Projects() {
  const { projects } = useContent();
  return (
    <>
      <PageHeader
        eyebrow="Projects"
        title="Things I have made, and one I am still making."
        intro="Some of these have full case studies; some are just quietly running. Status is honest."
      />

      <div className="wrap py-16 md:py-24">
        <table className="w-full text-left">
          <caption className="sr-only">Projects with year, status, and description</caption>
          <thead>
            <tr className="border-b border-foreground/20 text-xs uppercase tracking-widest text-muted-foreground">
              <th scope="col" className="py-3 pr-4 font-medium">Project</th>
              <th scope="col" className="hidden py-3 pr-4 font-medium sm:table-cell">Year</th>
              <th scope="col" className="py-3 pr-4 font-medium">Status</th>
              <th scope="col" className="hidden py-3 font-medium md:table-cell">Case study</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((p) => (
              <tr key={p.slug} className="border-b border-rule align-top">
                <th scope="row" className="py-6 pr-4 font-normal">
                  <span className="font-display text-xl">{p.name}</span>
                  <p className="mt-1 max-w-md text-sm leading-relaxed text-muted-foreground">{p.blurb}</p>
                </th>
                <td className="hidden py-6 pr-4 text-sm text-muted-foreground sm:table-cell">{p.year}</td>
                <td className="py-6 pr-4 text-sm">
                  <span className={p.status === "Live" ? "text-primary" : "text-muted-foreground"}>
                    {p.status}
                  </span>
                </td>
                <td className="hidden py-6 text-sm md:table-cell">
                  {p.caseStudy ? (
                    <Link to="/case-studies/$slug" params={{ slug: p.caseStudy }} className="link-underline">
                      Read
                    </Link>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
