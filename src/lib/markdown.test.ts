import { describe, expect, it } from "vitest";

import { markdownToParagraphs, renderMarkdown } from "./markdown";

describe("renderMarkdown", () => {
  it("returns empty string for blank input", () => {
    expect(renderMarkdown("")).toBe("");
    expect(renderMarkdown("   \n  ")).toBe("");
  });

  it("renders paragraphs, emphasis and links", () => {
    const html = renderMarkdown("Some **bold** and a [link](https://example.com).");
    expect(html).toContain("<strong>bold</strong>");
    expect(html).toContain('<a href="https://example.com">link</a>');
  });

  it("renders headings and images for studio-authored content", () => {
    const html = renderMarkdown("## Heading\n\n![A caption](https://cdn.example.com/pic.jpg)");
    expect(html).toContain("<h2>Heading</h2>");
    expect(html).toContain('<img src="https://cdn.example.com/pic.jpg" alt="A caption"');
  });
});

describe("markdownToParagraphs", () => {
  it("splits on blank lines and drops empty blocks", () => {
    expect(markdownToParagraphs("First.\n\n\nSecond.\n\n")).toEqual(["First.", "Second."]);
  });

  it("strips heading, list and emphasis markers", () => {
    expect(markdownToParagraphs("## Title\n\n- one\n- two\n\nSome *stress* here")).toEqual([
      "Title",
      "one two",
      "Some stress here",
    ]);
  });

  it("keeps link text but removes the target", () => {
    expect(markdownToParagraphs("See [the docs](https://example.com) now")).toEqual([
      "See the docs now",
    ]);
  });
});
