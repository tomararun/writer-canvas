/**
 * Absolute URLs for canonicals and social cards.
 * VITE_SITE_URL is inlined at build time; until it is set the values fall back
 * to root-relative paths, which browsers accept and most crawlers tolerate.
 */
const SITE_BASE = (import.meta.env["VITE_SITE_URL"] ?? "").replace(/\/+$/, "");

export function absoluteUrl(path: string): string {
  return SITE_BASE + path;
}

/** Canonical link entry for a route's head(). */
export function canonical(path: string) {
  return { rel: "canonical", href: absoluteUrl(path) };
}

export const OG_IMAGE = absoluteUrl("/og-default.png");
