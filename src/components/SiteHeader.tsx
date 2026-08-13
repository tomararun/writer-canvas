import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { site } from "@/content/site";

const nav = [
  { to: "/writing", label: "Writing" },
  { to: "/case-studies", label: "Case studies" },
  { to: "/journal", label: "Journal" },
  { to: "/projects", label: "Projects" },
  { to: "/archive", label: "Archive" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-rule bg-background/85 backdrop-blur">
      <div className="wrap flex h-16 items-center justify-between gap-6">
        <Link to="/" className="font-display text-lg tracking-tight">
          {site.name}
          <span className="text-primary">.</span>
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-6 lg:flex">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{ className: "text-foreground" }}
            >
              {item.label}
            </Link>
          ))}
          <Link
            to="/search"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Search the site"
          >
            Search
          </Link>
        </nav>

        <button
          type="button"
          className="text-sm lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>

      {open && (
        <nav id="mobile-nav" aria-label="Mobile" className="border-t border-rule lg:hidden">
          <ul className="wrap grid gap-1 py-4">
            {[...nav, { to: "/search", label: "Search" } as const].map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className="block py-2 text-base"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
