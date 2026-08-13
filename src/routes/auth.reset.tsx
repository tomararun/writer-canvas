import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { PageHeader } from "@/components/PageHeader";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth/reset")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Reset password — Studio access" },
      { name: "description", content: "Choose a new password for the writing studio." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  // The recovery link signs the visitor in through the URL fragment; without
  // that session there is nothing to reset.
  const [hasSession, setHasSession] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => setHasSession(Boolean(data.session)));
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setMessage("The two passwords do not match.");
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      await navigate({ to: "/admin", replace: true });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageHeader eyebrow="Studio" title="Choose a new password." />
      <div className="wrap py-16 md:py-24">
        {hasSession === null && (
          <p className="text-sm text-muted-foreground">Checking the reset link…</p>
        )}

        {hasSession === false && (
          <div className="max-w-sm">
            <p className="text-sm leading-relaxed">
              This reset link is invalid or has expired. Request a fresh one from the sign-in page.
            </p>
            <Link to="/auth" className="link-underline mt-6 inline-block text-sm text-primary">
              Back to sign in
            </Link>
          </div>
        )}

        {hasSession && (
          <form onSubmit={onSubmit} className="max-w-sm">
            <label htmlFor="new-password" className="eyebrow">
              New password
            </label>
            <input
              id="new-password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 w-full border-b border-foreground/30 bg-transparent py-2 outline-none focus:border-primary"
            />

            <label htmlFor="confirm-password" className="eyebrow mt-8 block">
              Confirm password
            </label>
            <input
              id="confirm-password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="mt-2 w-full border-b border-foreground/30 bg-transparent py-2 outline-none focus:border-primary"
            />

            <button
              type="submit"
              disabled={busy}
              className="mt-8 bg-primary px-5 py-2.5 text-sm text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {busy ? "Saving…" : "Set new password"}
            </button>

            {message && (
              <p role="status" className="mt-6 border-l-2 border-primary pl-4 text-sm">
                {message}
              </p>
            )}
          </form>
        )}
      </div>
    </>
  );
}
