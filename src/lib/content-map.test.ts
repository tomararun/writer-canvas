import { describe, expect, it } from "vitest";

import { mapCaseStudy, mapJournal, mapPost, mapProject } from "./content-map";

describe("mapPost", () => {
  it("maps a full row", () => {
    const post = mapPost({
      slug: "on-writing",
      title: "On Writing",
      dek: "A dek",
      date: "2026-08-13",
      category: "Essays",
      tags: ["craft", "attention"],
      reading_time: 7,
      featured: true,
      body: ["One.", "Two."],
      body_md: "One.\n\nTwo.",
    });
    expect(post).toEqual({
      slug: "on-writing",
      title: "On Writing",
      dek: "A dek",
      date: "2026-08-13",
      category: "Essays",
      tags: ["craft", "attention"],
      readingTime: 7,
      featured: true,
      body: ["One.", "Two."],
      bodyMd: "One.\n\nTwo.",
    });
  });

  it("falls back safely on malformed values", () => {
    const post = mapPost({ tags: "not-an-array", reading_time: "9", featured: "yes" });
    expect(post.tags).toEqual([]);
    expect(post.readingTime).toBe(5);
    expect(post.featured).toBe(false);
    expect(post.slug).toBe("");
  });

  it("filters non-string entries out of arrays", () => {
    const post = mapPost({ tags: ["ok", 3, null, "also-ok"] });
    expect(post.tags).toEqual(["ok", "also-ok"]);
  });
});

describe("mapCaseStudy", () => {
  it("defaults jsonb collections to empty arrays", () => {
    const cs = mapCaseStudy({ slug: "x" });
    expect(cs.process).toEqual([]);
    expect(cs.metrics).toEqual([]);
    expect(cs.gallery).toEqual([]);
  });
});

describe("mapJournal", () => {
  it("maps reflection paragraphs and markdown source", () => {
    const j = mapJournal({ slug: "day-1", reflection: ["A."], reflection_md: "A." });
    expect(j.reflection).toEqual(["A."]);
    expect(j.reflectionMd).toBe("A.");
  });
});

describe("mapProject", () => {
  it("omits optional fields when absent", () => {
    const p = mapProject({ slug: "tool", name: "Tool" });
    expect(p).not.toHaveProperty("link");
    expect(p).not.toHaveProperty("caseStudy");
    expect(p.status).toBe("Live");
  });

  it("keeps optional fields when present", () => {
    const p = mapProject({ slug: "tool", name: "Tool", link: "https://x", case_study: "cs" });
    expect(p.link).toBe("https://x");
    expect(p.caseStudy).toBe("cs");
  });
});
