import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { Prose } from "@/components/Prose";
import { formatDate } from "@/content/site";
import { getPreview, type PreviewType } from "@/lib/preview.functions";

export const Route = createFileRoute("/preview/$type/$slug")({
  ssr: false,
  validateSearch: (search: Record<string, unknown>) => ({
    token: typeof search["token"] === "string" ? search["token"] : "",
  }),
  head: () => ({
    meta: [
      { title: "Private preview — unpublished draft" },
      { name: "description", content: "A private preview of an unpublished draft." },
      { property: "og:title", content: "Private preview" },
      { property: "og:description", content: "A private preview of an unpublished draft." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: PreviewPage,
});

function PreviewPage() {
  const { type, slug } = Route.useParams();
  const { token } = Route.useSearch();

  const query = useQuery({
    queryKey: ["preview", type, slug, token],
    enabled: Boolean(token),
    queryFn: () => getPreview({ data: { type: type as PreviewType, slug, token } }),
  });

  if (!token) {
    return <Shell>This preview link is missing its access token.</Shell>;
  }
  if (query.isLoading) return <Shell>Loading preview…</Shell>;
  if (!query.data || query.data.ok !== true) {
    return <Shell>This preview link is not valid, or the entry has been removed.</Shell>;
  }

  const data = query.data;
  const body =
    data.post?.bodyMd?.trim() ||
    data.journal?.reflectionMd?.trim() ||
    "";
  const paragraphs = data.post?.body ?? data.journal?.reflection ?? [];
  const title = data.post?.title ?? data.caseStudy?.title ?? data.journal?.title ?? slug;
  const date = data.post?.date ?? data.journal?.date ?? "";

  return (
    <>
      <div className="border-b border-rule bg-secondary/40">
        <div className="wrap flex flex-wrap items-center justify-between gap-3 py-3 text-xs">
          <span className="eyebrow">Private preview · {data.status}</span>
          {data.scheduledFor && (
            <span className="text-muted-foreground">
              Goes live {new Date(data.scheduledFor).toLocaleString()}
            </span>
          )}
        </div>
      </div>

      <article className="wrap py-16 md:py-24">
        <h1 className="max-w-3xl font-display text-4xl leading-tight md:text-6xl">{title}</h1>
        {date && (
          <p className="mt-6 text-sm text-muted-foreground">
            <time dateTime={date}>{formatDate(date)}</time>
          </p>
        )}

        <div className="mt-12 max-w-2xl">
          {body ? (
            <Prose markdown={body} />
          ) : data.caseStudy ? (
            <div className="prose-editorial">
              <p>{data.caseStudy.summary}</p>
              <p>{data.caseStudy.background}</p>
              <p>{data.caseStudy.problem}</p>
              <p>{data.caseStudy.outcomes}</p>
            </div>
          ) : (
            <div className="prose-editorial">
              {paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          )}
        </div>
      </article>
    </>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return <div className="wrap py-24 text-sm text-muted-foreground">{children}</div>;
}
