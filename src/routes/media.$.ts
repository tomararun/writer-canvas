import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

/**
 * Serves files from the private `media` storage bucket at stable URLs.
 * The bucket's RLS lets anyone read, so the publishable key suffices; going
 * through the app means image links never expire the way signed URLs do,
 * and keep working whether the bucket is public or private.
 */
export const Route = createFileRoute("/media/$")({
  server: {
    handlers: {
      GET: async ({ params }: { params: { _splat?: string } }) => {
        const name = params._splat ?? "";
        // One flat namespace; reject anything path-like.
        if (!name || name.includes("/") || name.includes("..") || name.length > 200) {
          return new Response("Not found", { status: 404 });
        }

        const { publicSupabase } = await import("@/lib/supabase-public.server");
        const { data, error } = await publicSupabase().storage.from("media").download(name);
        if (error || !data) return new Response("Not found", { status: 404 });

        return new Response(data, {
          headers: {
            "Content-Type": data.type || "application/octet-stream",
            "Cache-Control": "public, max-age=31536000, immutable",
          },
        });
      },
    },
  },
});
