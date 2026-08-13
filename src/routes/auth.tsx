import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { PageHeader } from "@/components/PageHeader";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Studio access" },
      {
        name: "description",
        content:
          "Sign in to the writing studio to draft, edit, and publish essays and case studies.",
      },
      { property: "og:title", content: "Sign in — Studio access" },
      { property: "og:description", content: "Private studio access for publishing." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "/auth" }],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => {
      if (data.session) void navigate({ to: "/admin", replace: true });
    });
  }, [navigate]);

  async function onForgotPassword() {
    if (!email.trim()) {
      setMessage("Enter your email above first, then tap “Forgot password?” again.");
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + "/auth/reset",
      });
      if (error) throw error;
      setMessage("Check your inbox — the reset link signs you in to choose a new password.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin + "/admin" },
        });
        if (error) throw error;
        if (data.session) {
          await navigate({ to: "/admin", replace: true });
          return;
        }
        setMessage("Check your inbox to confirm the address, then sign in.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        await navigate({ to: "/admin", replace: true });
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageHeader eyebrow="Studio" title="Sign in to the studio." />
      <div className="wrap py-16 md:py-24">
        <form onSubmit={onSubmit} className="max-w-sm">
          <label htmlFor="email" className="eyebrow">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-2 w-full border-b border-foreground/30 bg-transparent py-2 outline-none focus:border-primary"
          />

          <div className="mt-8 flex items-baseline justify-between gap-4">
            <label htmlFor="password" className="eyebrow">
              Password
            </label>
            {mode === "signin" && (
              <button
                type="button"
                disabled={busy}
                className="link-underline text-xs text-muted-foreground"
                onClick={onForgotPassword}
              >
                Forgot password?
              </button>
            )}
          </div>
          <input
            id="password"
            type="password"
            required
            minLength={8}
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-2 w-full border-b border-foreground/30 bg-transparent py-2 outline-none focus:border-primary"
          />

          <button
            type="submit"
            disabled={busy}
            className="mt-8 bg-primary px-5 py-2.5 text-sm text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {busy ? "Working…" : mode === "signup" ? "Create account" : "Sign in"}
          </button>

          <p className="mt-6 text-sm text-muted-foreground">
            {mode === "signup" ? "Already have an account?" : "First time here?"}{" "}
            <button
              type="button"
              className="link-underline text-primary"
              onClick={() => {
                setMode(mode === "signup" ? "signin" : "signup");
                setMessage("");
              }}
            >
              {mode === "signup" ? "Sign in" : "Create the studio account"}
            </button>
          </p>

          {message && (
            <p role="status" className="mt-6 border-l-2 border-primary pl-4 text-sm">
              {message}
            </p>
          )}
        </form>
      </div>
    </>
  );
}
