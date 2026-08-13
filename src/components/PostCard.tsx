import { Link } from "@tanstack/react-router";
import { formatDate, type Post } from "@/content/site";

export function PostCard({ post, large = false }: { post: Post; large?: boolean }) {
  return (
    <article className="group border-t border-rule pt-6">
      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        <span className="text-primary">{post.category}</span>
        <span aria-hidden>·</span>
        <time dateTime={post.date}>{formatDate(post.date)}</time>
        <span aria-hidden>·</span>
        <span>{post.readingTime} min read</span>
      </div>
      <h3
        className={
          large
            ? "mt-3 font-display text-3xl leading-tight sm:text-4xl"
            : "mt-3 font-display text-2xl leading-tight"
        }
      >
        <Link
          to="/writing/$slug"
          params={{ slug: post.slug }}
          className="transition-colors group-hover:text-primary"
        >
          {post.title}
        </Link>
      </h3>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
        {post.dek}
      </p>
      <ul className="mt-4 flex flex-wrap gap-2">
        {post.tags.map((t) => (
          <li key={t} className="border border-rule px-2 py-0.5 text-xs text-muted-foreground">
            #{t}
          </li>
        ))}
      </ul>
    </article>
  );
}
