import { useState } from "react";

import { subscribeToNewsletter } from "@/lib/content.functions";

export function NewsletterSignup({ compact = false }: { compact?: boolean }) {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  return (
    <section
      id="newsletter"
      aria-labelledby="newsletter-heading"
      className={compact ? "" : "max-w-lg"}
    >
      <p className="eyebrow mb-3">The Margins</p>
      <h2 id="newsletter-heading" className="font-display text-2xl leading-snug sm:text-3xl">
        One essay a week, on craft and attention.
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        No growth tactics, no roundups. Just the piece I would want to read on a Sunday morning.
        Unsubscribe whenever.
      </p>

      {done ? (
        <p role="status" className="mt-6 border-l-2 border-primary pl-4 text-sm">
          Thank you — you are on the list.
        </p>
      ) : (
        <form
          className="mt-6 flex flex-col gap-3 sm:flex-row"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!email.trim()) return;
            setBusy(true);
            setError("");
            try {
              await subscribeToNewsletter({ data: { email } });
              setDone(true);
            } catch {
              setError("That did not save. Try again in a moment.");
            } finally {
              setBusy(false);
            }
          }}
        >
          <label htmlFor="newsletter-email" className="sr-only">
            Email address
          </label>
          <input
            id="newsletter-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full border-b border-foreground/30 bg-transparent px-1 py-2 text-sm outline-none placeholder:text-muted-foreground focus:border-primary"
          />
          <button
            type="submit"
            disabled={busy}
            className="shrink-0 disabled:opacity-50 bg-primary px-5 py-2.5 text-sm text-primary-foreground transition-opacity hover:opacity-90"
          >
            {busy ? "Saving…" : "Subscribe"}
          </button>
        </form>
      )}

      {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
    </section>
  );
}
