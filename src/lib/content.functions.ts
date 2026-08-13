import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import type { SiteContent } from "./content-map";

export const getSiteContent = createServerFn({ method: "GET" }).handler(
  async (): Promise<SiteContent> => {
    const { loadSiteContent } = await import("./content.server");
    return loadSiteContent();
  },
);

export const subscribeToNewsletter = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({ email: z.string().trim().email().max(255) }).parse(input),
  )
  .handler(async ({ data }) => {
    const { publicSupabase } = await import("./supabase-public.server");
    const supabase = publicSupabase();
    const { error } = await supabase
      .from("subscribers")
      .insert({ email: data.email.toLowerCase() });
    // Duplicate email is a no-op success from the reader's point of view.
    if (error && error.code !== "23505") throw new Error("Could not save that address.");
    return { ok: true };
  });
