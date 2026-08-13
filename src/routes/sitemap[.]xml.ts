import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        const { loadSiteContent } = await import("@/lib/content.server");
        const { getSiteOrigin } = await import("@/lib/site-url.server");
        const origin = getSiteOrigin(request);
        const { posts, caseStudies, journal } = await loadSiteContent();
        const paths = [
          "/",
          "/about",
          "/writing",
          "/case-studies",
          "/journal",
          "/projects",
          "/archive",
          "/contact",
          ...posts.map((p) => `/writing/${p.slug}`),
          ...caseStudies.map((c) => `/case-studies/${c.slug}`),
          ...journal.map((j) => `/journal/${j.slug}`),
        ];

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...paths.map((p) => `  <url>\n    <loc>${origin}${p}</loc>\n  </url>`),
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=3600" },
        });
      },
    },
  },
});
