import type { SupabaseClient } from "@supabase/supabase-js";

import { supabase } from "@/integrations/supabase/client";

/** Private surfaces and preview links never count as traffic. */
const EXCLUDED_PREFIXES = ["/admin", "/auth", "/preview", "/api"];

let lastTracked = "";

/**
 * Record one first-party page view: path and referrer only — no cookies, no
 * user identifiers. Fire-and-forget; analytics must never break the page.
 */
export function trackPageView(path: string): void {
  if (typeof window === "undefined") return;
  if (EXCLUDED_PREFIXES.some((p) => path === p || path.startsWith(p + "/"))) return;
  if (path === lastTracked) return;
  lastTracked = path;

  const referrer =
    document.referrer && !document.referrer.startsWith(window.location.origin)
      ? document.referrer.slice(0, 300)
      : null;

  // page_views is not in the generated Database types yet; the insert shape
  // is enforced by the table schema and RLS.
  void (supabase as unknown as SupabaseClient)
    .from("page_views")
    .insert({ path: path.slice(0, 300), referrer })
    .then(({ error }) => {
      if (error) console.debug("page view not recorded:", error.message);
    });
}
