import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { site } from "@/content/site";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Maya Ellsworth, writer and editorial architect" },
      {
        name: "description",
        content:
          "Bio, writing themes, tools, timeline, and values of Maya Ellsworth — a writer working on craft, attention, and editorial systems.",
      },
      { property: "og:title", content: "About — Maya Ellsworth" },
      { property: "og:description", content: "Bio, themes, tools, timeline, and values." },
      { property: "og:type", content: "profile" },
      { property: "og:url", content: "/about" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  component: About,
});

const themes = [
  { title: "Craft", body: "How sentences are made, and why a shape can be an argument." },
  { title: "Attention", body: "What we protect, what we spend, and what it costs to be interruptible." },
  { title: "Systems", body: "Notebooks, archives, and the quiet infrastructure of thinking." },
  { title: "Growth in public", body: "Learning with the seams showing, on purpose." },
];

const tools = [
  ["Drafting", "iA Writer, paper, a very old fountain pen"],
  ["Notes", "Commonplace (mine), plain text, index cards"],
  ["Editing", "Read-aloud passes, hand-copied paragraphs"],
  ["Publishing", "This site, The Margins newsletter"],
  ["Research", "Interviews, archives, a little SQL"],
];

const timeline = [
  ["2026", "Editorial lead, Field Notes Quarterly. Writing a book-length essay."],
  ["2025", "Content architect at Atlas. Rebuilt a 600-article library."],
  ["2024", "Started The Margins. 104 weeks without missing one."],
  ["2021", "Went independent. Learned that invoicing is also writing."],
  ["2016", "Staff writer. Learned to be edited without flinching."],
  ["2011", "First published essay, in a magazine that no longer exists."],
];

const values = [
  "Be useful before being clever.",
  "Cite generously; the reader deserves the road back.",
  "Publish the correction as loudly as the claim.",
  "Slow is a strategy, not an apology.",
];

function About() {
  return (
    <>
      <PageHeader
        eyebrow="About"
        title="I make things easier to read and harder to forget."
        intro={`I'm ${site.name}, a writer and editorial architect in ${site.location}. For fifteen years I have worked on the same problem from different angles: how to make a complicated thing land in someone else's head without flattening it.`}
      />

      <section className="wrap py-16 md:py-24">
        <div className="grid gap-16 md:grid-cols-[2fr_1fr]">
          <div className="prose-editorial">
            <p>
              I started in magazines, where I learned that most writing problems are structure problems
              wearing a costume. Then I spent five years inside software companies, where I learned that
              most structure problems are actually organisational ones.
            </p>
            <p>
              Now I split my time between my own essays and editorial systems work for publications and
              product teams — voice guides, information architecture, article patterns, the unglamorous
              scaffolding that lets other people write well consistently.
            </p>
            <p>
              I publish everything here: finished essays, case studies with the messy middle included,
              and a weekly journal of whatever I am currently bad at.
            </p>
          </div>

          <aside className="border-l border-rule pl-6">
            <h2 className="eyebrow">Values</h2>
            <ul className="mt-4 grid gap-4 text-sm leading-relaxed">
              {values.map((v) => (
                <li key={v} className="border-b border-rule pb-4 last:border-0">{v}</li>
              ))}
            </ul>
          </aside>
        </div>
      </section>

      <section aria-labelledby="themes" className="border-y border-rule bg-paper">
        <div className="wrap py-16 md:py-24">
          <h2 id="themes" className="font-display text-3xl sm:text-4xl">Writing themes</h2>
          <ul className="mt-10 grid gap-px bg-rule sm:grid-cols-2 lg:grid-cols-4">
            {themes.map((t) => (
              <li key={t.title} className="bg-paper p-6">
                <h3 className="font-display text-xl">{t.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="tools" className="wrap py-16 md:py-24">
        <div className="grid gap-16 md:grid-cols-2">
          <div>
            <h2 id="tools" className="font-display text-3xl">Tools</h2>
            <table className="mt-8 w-full text-sm">
              <caption className="sr-only">Tools used for each part of the writing process</caption>
              <tbody>
                {tools.map(([k, v]) => (
                  <tr key={k} className="border-b border-rule">
                    <th scope="row" className="py-3 pr-6 text-left font-normal text-muted-foreground">{k}</th>
                    <td className="py-3">{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div>
            <h2 className="font-display text-3xl">Timeline</h2>
            <ol className="mt-8 grid gap-6">
              {timeline.map(([year, body]) => (
                <li key={year} className="grid grid-cols-[4rem_1fr] gap-4 border-b border-rule pb-6">
                  <span className="font-display text-lg text-primary">{year}</span>
                  <p className="text-sm leading-relaxed">{body}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>
    </>
  );
}
