import { infiniteQueryOptions } from '@tanstack/react-query';
import { aggregateArticles } from '@/features/articles/api/aggregate';
import { PROVIDER_IDS, type ArticleQuery } from '@/features/articles/types';

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
    refetchOnWindowFocus: false,
  });
}
