const RESET_PATH = "/auth/reset";

/**
 * A password-reset email signs the visitor in through the URL fragment
 * (`#access_token=…&type=recovery`). Supabase lands it on /auth/reset only when
 * that URL is in the project's redirect allow-list; otherwise it falls back to
 * the Site URL, where /auth and /admin treat it as a plain sign-in and the
 * reset form never shows.
 *
 * Returns where to send such a stray recovery link — the reset page, fragment
 * intact so it can still establish the session — or null when no redirect is
 * needed.
 */
export function recoveryRedirectTarget(pathname: string, hash: string): string | null {
  if (pathname === RESET_PATH) return null;
  const params = new URLSearchParams(hash.replace(/^#/, ""));
  if (params.get("type") !== "recovery" || !params.get("access_token")) return null;
  return RESET_PATH + hash;
}
