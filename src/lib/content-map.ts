import type { CaseStudy, Journal, Post, Project } from "@/content/site";

/** Pure row -> app-shape mappers. Safe to import anywhere. */

export type SiteContent = {
  posts: Post[];
  caseStudies: CaseStudy[];
  journal: Journal[];
  projects: Project[];
};

type Row = Record<string, unknown>;

const str = (v: unknown, fallback = "") => (typeof v === "string" ? v : fallback);
const strArr = (v: unknown) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : []);

export function mapPost(row: Row): Post {
  return {
    slug: str(row["slug"]),
    title: str(row["title"]),
    dek: str(row["dek"]),
    date: str(row["date"]),
    category: str(row["category"]),
    tags: strArr(row["tags"]),
    readingTime: typeof row["reading_time"] === "number" ? row["reading_time"] : 5,
    featured: row["featured"] === true,
    body: strArr(row["body"]),
    bodyMd: str(row["body_md"]),
  };
}

export function mapCaseStudy(row: Row): CaseStudy {
  return {
    slug: str(row["slug"]),
    title: str(row["title"]),
    summary: str(row["summary"]),
    client: str(row["client"]),
    year: str(row["year"]),
    role: str(row["role"]),
    tags: strArr(row["tags"]),
    featured: row["featured"] === true,
    background: str(row["background"]),
    problem: str(row["problem"]),
    process: (row["process"] as CaseStudy["process"]) ?? [],
    implementation: strArr(row["implementation"]),
    outcomes: str(row["outcomes"]),
    metrics: (row["metrics"] as CaseStudy["metrics"]) ?? [],
    learnings: strArr(row["learnings"]),
    gallery: (row["gallery"] as CaseStudy["gallery"]) ?? [],
  };
}

export function mapJournal(row: Row): Journal {
  return {
    slug: str(row["slug"]),
    title: str(row["title"]),
    date: str(row["date"]),
    topic: str(row["topic"]),
    reflection: strArr(row["reflection"]),
    reflectionMd: str(row["reflection_md"]),
    resources: (row["resources"] as Journal["resources"]) ?? [],
  };
}

export function mapProject(row: Row): Project {
  const project: Project = {
    slug: str(row["slug"]),
    name: str(row["name"]),
    blurb: str(row["blurb"]),
    year: str(row["year"]),
    status: (str(row["status"], "Live") as Project["status"]) ?? "Live",
  };
  if (typeof row["link"] === "string") project.link = row["link"];
  if (typeof row["case_study"] === "string") project.caseStudy = row["case_study"];
  return project;
}
