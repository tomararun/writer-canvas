import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { site } from "@/content/site";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Commissions, collaborations & correspondence" },
      {
        name: "description",
        content:
          "Get in touch about editorial commissions, content architecture work, speaking, or just to argue with something I wrote.",
      },
      { property: "og:title", content: "Contact — Maya Ellsworth" },
      { property: "og:description", content: "Commissions, collaborations, and correspondence." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/contact" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
  component: Contact,
});

function Contact() {
  const [sent, setSent] = useState(false);

  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title="Say something specific and I'll almost always reply."
        intro="Commissions, editorial systems work, speaking, or a disagreement with a paragraph — all welcome. I read everything, usually within a week."
      />

      <div className="wrap grid gap-16 py-16 md:grid-cols-[2fr_1fr] md:py-24">
        {sent ? (
          <p role="status" className="border-l-2 border-primary pl-6 text-lg leading-relaxed">
            Thank you — your note is on its way. I answer in batches on Fridays, so give me a few days.
          </p>
        ) : (
          <form
            className="grid max-w-xl gap-6"
            onSubmit={(e) => {
              e.preventDefault();
              setSent(true);
            }}
          >
            <div className="grid gap-2">
              <label htmlFor="name" className="text-sm">Name</label>
              <input id="name" name="name" required className="border-b border-foreground/30 bg-transparent py-2 outline-none focus:border-primary" />
            </div>
            <div className="grid gap-2">
              <label htmlFor="email" className="text-sm">Email</label>
              <input id="email" name="email" type="email" required className="border-b border-foreground/30 bg-transparent py-2 outline-none focus:border-primary" />
            </div>
            <div className="grid gap-2">
              <label htmlFor="subject" className="text-sm">What is this about?</label>
              <select id="subject" name="subject" className="border-b border-foreground/30 bg-transparent py-2 outline-none focus:border-primary">
                <option>A commission</option>
                <option>Editorial systems work</option>
                <option>Speaking or teaching</option>
                <option>Something I wrote</option>
              </select>
            </div>
            <div className="grid gap-2">
              <label htmlFor="message" className="text-sm">Message</label>
              <textarea id="message" name="message" rows={6} required className="border border-rule bg-paper p-3 outline-none focus:border-primary" />
            </div>
            <button type="submit" className="justify-self-start bg-primary px-6 py-3 text-sm text-primary-foreground transition-opacity hover:opacity-90">
              Send note
            </button>
          </form>
        )}

        <aside className="grid gap-10">
          <div>
            <h2 className="eyebrow">Direct</h2>
            <p className="mt-3 text-sm">
              <a href={`mailto:${site.email}`} className="link-underline">{site.email}</a>
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{site.location}</p>
          </div>
          <div>
            <h2 className="eyebrow">Elsewhere</h2>
            <ul className="mt-3 grid gap-2 text-sm">
              {site.socials.map((s) => (
                <li key={s.label}><a href={s.href} className="link-underline">{s.label}</a></li>
              ))}
            </ul>
          </div>
          <div className="border-l border-rule pl-5">
            <h2 className="eyebrow">On collaboration</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              I take on two editorial systems projects a year and a handful of commissions. I work best
              with teams who already care about the words and want help making that care repeatable.
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}
