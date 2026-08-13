import { marked } from "marked";

marked.setOptions({ gfm: true, breaks: false });

/** Render admin-authored markdown to HTML. Content comes from the single admin seat only. */
export function renderMarkdown(md: string): string {
  if (!md?.trim()) return "";
  return marked.parse(md, { async: false });
}

/** Plain-text paragraphs derived from markdown — used for excerpts and legacy rendering. */
export function markdownToParagraphs(md: string): string[] {
  return md
    .split(/\n{2,}/)
    .map((block) =>
      block
        .replace(/^#{1,6}\s+/gm, "")
        .replace(/^[>\-*+]\s+/gm, "")
        .replace(/[*_`]/g, "")
        .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
        .replace(/\s+/g, " ")
        .trim(),
    )
    .filter(Boolean);
}
