import { Link } from "@tanstack/react-router";
import { site } from "@/content/site";
import { NewsletterSignup } from "./NewsletterSignup";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-rule bg-paper">
      <div className="wrap grid gap-12 py-16 md:grid-cols-[1.2fr_1fr] md:py-20">
        <NewsletterSignup />

        <div className="grid grid-cols-2 gap-8 text-sm">
          <div>
            <h3 className="eyebrow mb-4">Explore</h3>
            <ul className="grid gap-2">
              <li><Link to="/writing" className="link-underline">Writing</Link></li>
              <li><Link to="/case-studies" className="link-underline">Case studies</Link></li>
              <li><Link to="/journal" className="link-underline">Learning journal</Link></li>
              <li><Link to="/projects" className="link-underline">Projects</Link></li>
              <li><Link to="/archive" className="link-underline">Archive</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="eyebrow mb-4">Elsewhere</h3>
            <ul className="grid gap-2">
              {site.socials.map((s) => (
                <li key={s.label}>
                  <a href={s.href} className="link-underline">{s.label}</a>
                </li>
              ))}
              <li>
                <a href={`mailto:${site.email}`} className="link-underline">Email</a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-rule">
        <div className="wrap flex flex-col gap-2 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {site.name}. Written in {site.location}.</p>
          <p>Set in Newsreader &amp; Work Sans.</p>
        </div>
      </div>
    </footer>
  );
}
