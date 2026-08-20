import { infiniteQueryOptions } from '@tanstack/react-query';
import { aggregateArticles } from '@/features/articles/api/aggregate';
import { PROVIDER_IDS, type ArticleQuery } from '@/features/articles/types';
import { isRetryableApiError } from '@/lib/http';

const MAX_RETRIES = 2;

export function articleFeedQueryOptions(query: ArticleQuery) {
  return infiniteQueryOptions({
    queryKey: [
      'articles',
      'feed',
      {
        search: query.search,
        categories: [...query.categories].sort(),
        from: query.from,
        to: query.to,
        providers: PROVIDER_IDS.filter((id) => query.providers.includes(id)),
      },
    ],
    queryFn: ({ pageParam, signal }) => aggregateArticles({ query, page: pageParam, signal }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, _pages, lastPageParam) =>
      lastPage.hasMore ? lastPageParam + 1 : undefined,
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    retry: (failureCount, error) => failureCount < MAX_RETRIES && isRetryableApiError(error),
    retryDelay: (attempt) => Math.min(1_000 * 2 ** attempt, 8_000),
    refetchOnWindowFocus: false,
  });
}
