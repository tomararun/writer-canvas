import { renderMarkdown } from "@/lib/markdown";

/** Renders admin-authored markdown inside the editorial prose styles. */
export function Prose({ markdown, className }: { markdown: string; className?: string }) {
  return (
    <div
      className={className ?? "prose-editorial"}
      // Markdown is authored exclusively by the single admin account.
      dangerouslySetInnerHTML={{ __html: renderMarkdown(markdown) }}
    />
  );
}
