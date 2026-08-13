/**
 * Absolute site origin for feeds, sitemaps and canonical links.
 * Prefers an explicit SITE_URL env var (set this once a custom domain exists),
 * then proxy forwarding headers, then the origin the request came in on.
 */
export function getSiteOrigin(request: Request): string {
  const configured = process.env["SITE_URL"];
  if (configured) return configured.replace(/\/+$/, "");

  const url = new URL(request.url);
  const proto = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const host = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  return `${proto || url.protocol.replace(":", "")}://${host || url.host}`;
}
