import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

export const Route = createFileRoute("/robots.txt")({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        const { getSiteOrigin } = await import("@/lib/site-url.server");
        const origin = getSiteOrigin(request);

        // Private surfaces (/admin, /auth, /preview) are deliberately NOT
        // listed here: naming them would advertise their existence, and each
        // already carries a noindex meta tag — which crawlers can only obey
        // if they are allowed to fetch the page.
        const body = [
          "User-agent: *",
          "Allow: /",
          "Disallow: /api/",
          "",
          `Sitemap: ${origin}/sitemap.xml`,
          "",
        ].join("\n");

        return new Response(body, {
          headers: { "Content-Type": "text/plain", "Cache-Control": "public, max-age=3600" },
        });
      },
    },
  },
});
