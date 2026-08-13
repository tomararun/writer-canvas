import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";

import { getSiteContent } from "./content.functions";

export const contentQueryOptions = queryOptions({
  queryKey: ["site-content"],
  queryFn: () => getSiteContent(),
  staleTime: 60_000,
});

export function useContent() {
  return useSuspenseQuery(contentQueryOptions).data;
}
