import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { site } from "@/content/site";

function escapeXml(value: string) {
  return value.replace(
    /[<>&'"]/g,
    (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[c] as string,
  );
}

export const Route = createFileRoute("/rss.xml")({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        const { loadSiteContent } = await import("@/lib/content.server");
        const { getSiteOrigin } = await import("@/lib/site-url.server");
        const origin = getSiteOrigin(request);
        const { posts } = await loadSiteContent();
        const items = posts
          .map(
            (p) =>
              `    <item>\n      <title>${escapeXml(p.title)}</title>\n      <link>${origin}/writing/${p.slug}</link>\n      <guid isPermaLink="true">${origin}/writing/${p.slug}</guid>\n      <pubDate>${new Date(p.date + "T00:00:00Z").toUTCString()}</pubDate>\n      <description>${escapeXml(p.dek)}</description>\n    </item>`,
          )
          .join("\n");

        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(site.name)} — Writing</title>
    <link>${origin}/writing</link>
    <description>${escapeXml(site.tagline)}</description>
${items}
  </channel>
</rss>`;

        return new Response(xml, {
          headers: {
            "Content-Type": "application/rss+xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
