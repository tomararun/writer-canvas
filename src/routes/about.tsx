import { absoluteUrl, canonical } from "@/lib/seo";
import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { site } from "@/content/site";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: `About — ${site.name}` },
      {
        name: "description",
        content: `About ${site.name}: ${site.role}.`,
      },
      { property: "og:title", content: `About — ${site.name}` },
      { property: "og:description", content: "Bio, themes, tools, timeline, and values." },
      { property: "og:type", content: "profile" },
      { property: "og:url", content: absoluteUrl("/about") },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [canonical("/about")],
  }),
  component: About,
});

function About() {
  return (
    <>
      <PageHeader
        eyebrow="About"
        title="I'm a developer who writes."
        intro={`I'm ${site.name}, based in ${site.location}. ${site.role}.`}
      />

      <section className="wrap py-16 md:py-24">
        <div className="prose-editorial max-w-2xl">
          <p>
            For the past year I've built web applications with React, Node.js, and TypeScript, and
            I've been moving into DevOps and cloud-native work, which is where most of the new
            things I write about come from.
          </p>
          <p>
            This site is where I document that work: the projects I build, the stacks and tools I'm
            learning, and the problems I run into along the way. Each case study covers what I was
            trying to do, the decisions I made, and what I'd change next time. The learning journal
            records the languages and tools I'm studying, including the parts that didn't go well.
          </p>
          <p>
            I also write for other people's projects. I work with developer tools and SaaS teams on
            documentation, guides, and content where the technical details have to be right, and I'm
            available for ghostwriting and other writing work in that space.
          </p>
          <p>
            Everything you'll find in the{" "}
            <Link to="/projects" className="link-underline text-primary">
              Projects
            </Link>{" "}
            and{" "}
            <Link to="/case-studies" className="link-underline text-primary">
              Case studies
            </Link>{" "}
            sections is a sample of how I think through a problem and explain it, so if you're
            considering working together, that's the best place to start.
          </p>
          <p>
            If you're a team that needs clear technical writing, or if you're building something you
            think I'd find interesting, I'd like to hear from you. You can reach me through the{" "}
            <Link to="/contact" className="link-underline text-primary">
              contact page
            </Link>
            .
          </p>
        </div>
      </section>
    </>
  );
}
