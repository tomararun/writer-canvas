import { createFileRoute } from "@tanstack/react-router";

/**
 * Manual fallback to publish any entry whose scheduled time has passed.
 * The primary trigger is the pg_cron job inside the database
 * (supabase/migrations/20260813120000_schedule_publish_due_content.sql);
 * this endpoint exists for ad-hoc runs and external schedulers.
 * Guarded by the project's publishable API key.
 */
export const Route = createFileRoute("/api/public/hooks/publish-scheduled")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = request.headers.get("apikey");
        if (!apiKey || apiKey !== process.env["SUPABASE_PUBLISHABLE_KEY"]) {
          return new Response(JSON.stringify({ error: "Unauthorized" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
          });
        }

        const { publicSupabase } = await import("@/lib/supabase-public.server");
        const { data, error } = await publicSupabase().rpc("publish_due_content");
        if (error) {
          console.error("publish_due_content failed", error.message);
          return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }

        return Response.json({ published: data ?? 0 });
      },
    },
  },
});
