import { useContent } from "@/lib/content";
import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { formatDate } from "@/content/site";

export const Route = createFileRoute("/journal/")({
  head: () => ({
    meta: [
      { title: "Learning journal — Weekly notes in public" },
      {
        name: "description",
        content:
          "A weekly learning journal: what I studied, what confused me, what changed my practice, and the resources that helped.",
      },
      { property: "og:title", content: "Learning journal — Weekly notes in public" },
      { property: "og:description", content: "Weekly notes on learning in public." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/journal" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/journal" }],
  }),
  component: JournalIndex,
});

function JournalIndex() {
  const { journal } = useContent();
  return (
    <>
      <PageHeader
        eyebrow="Learning journal"
        title="Notes from whatever I am currently bad at."
        intro="One entry a week: the topic, an honest reflection, and the resources that actually helped. Kept in public so the growth is legible — to you and to me."
      />

      <div className="wrap py-16 md:py-24">
        <ol className="grid gap-10">
          {journal.map((j) => (
            <li key={j.slug} className="grid gap-4 border-t border-rule pt-6 md:grid-cols-[1fr_3fr]">
              <div>
                <time className="text-sm text-muted-foreground" dateTime={j.date}>
                  {formatDate(j.date)}
                </time>
                <p className="mt-1 text-sm text-primary">{j.topic}</p>
              </div>
              <div>
                <h2 className="font-display text-2xl leading-snug">
                  <Link to="/journal/$slug" params={{ slug: j.slug }} className="hover:text-primary">
                    {j.title}
                  </Link>
                </h2>
                <p className="mt-3 max-w-2xl leading-relaxed text-muted-foreground">{j.reflection[0]}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </>
  );
}
