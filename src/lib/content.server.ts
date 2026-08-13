import { mapCaseStudy, mapJournal, mapPost, mapProject, type SiteContent } from "./content-map";
import { publicSupabase } from "./supabase-public.server";

/** Server-only loader for all published site content. */
export async function loadSiteContent(): Promise<SiteContent> {
  const supabase = publicSupabase();

  const [posts, caseStudies, journal, projects] = await Promise.all([
    supabase.from("posts").select("*").eq("published", true).order("date", { ascending: false }),
    supabase
      .from("case_studies")
      .select("*")
      .eq("published", true)
      .order("year", { ascending: false }),
    supabase
      .from("journal_entries")
      .select("*")
      .eq("published", true)
      .order("date", { ascending: false }),
    supabase.from("projects").select("*").order("year", { ascending: false }),
  ]);

  return {
    posts: (posts.data ?? []).map(mapPost),
    caseStudies: (caseStudies.data ?? []).map(mapCaseStudy),
    journal: (journal.data ?? []).map(mapJournal),
    projects: (projects.data ?? []).map(mapProject),
  };
}
