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
  .inputValidator((input) => z.object({ email: z.string().trim().email().max(255) }).parse(input))
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

export const sendContactMessage = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        name: z.string().trim().min(1).max(200),
        email: z.string().trim().email().max(255),
        subject: z.string().trim().max(200).default(""),
        message: z.string().trim().min(1).max(10_000),
        // Honeypot: hidden field real visitors leave empty.
        website: z.string().max(0).optional().or(z.literal("")),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { publicSupabase } = await import("./supabase-public.server");
    const { error } = await publicSupabase().from("contact_messages").insert({
      name: data.name,
      email: data.email.toLowerCase(),
      subject: data.subject,
      message: data.message,
    });
    if (error) throw new Error("Could not send your note. Try again in a moment.");
    return { ok: true };
  });
