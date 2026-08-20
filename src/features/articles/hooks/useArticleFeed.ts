import { useInfiniteQuery } from '@tanstack/react-query';
import { articleFeedQueryOptions } from '@/features/articles/queries';
import type { Article, ArticleQuery, ProviderFailure } from '@/features/articles/types';

type UseArticleFeedInput = {
  query: ArticleQuery;
  /** Applied after fetch for filters the APIs cannot express (source, and category on NewsAPI). */
  refine?: ((article: Article) => boolean) | undefined;
};

export type ArticleFeed = {
  articles: readonly Article[];
  /** Articles loaded but hidden by client-side refinement. */
  hiddenCount: number;
  failures: readonly ProviderFailure[];
  /** First load for this query key: show skeletons. */
  isInitialLoading: boolean;
  /** Revalidating data that is already on screen. */
  isRefreshing: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  /** Every provider failed. */
  isError: boolean;
  error: Error | null;
  /** A page after the first failed; the list itself is still usable. */
  hasNextPageError: boolean;
  isEmpty: boolean;
  /**
   * TanStack Query's own bound callbacks: stable across renders, which keeps the
   * infinite-scroll effect from re-running on every render.
   */
  fetchNextPage: () => unknown;
  refetch: () => unknown;
};

export function useArticleFeed({ query, refine }: UseArticleFeedInput): ArticleFeed {
  const {
    data,
    error,
    isError,
    isPending,
    isFetching,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useInfiniteQuery(articleFeedQueryOptions(query));

  const pages = data?.pages ?? [];
  const loaded = pages.flatMap((page) => page.articles);
  const articles = refine ? loaded.filter(refine) : loaded;

  // Failures are per page; the newest page reflects the current provider state.
  const failures = pages.at(-1)?.failures ?? [];

  return {
    articles,
    hiddenCount: loaded.length - articles.length,
    failures,
    isInitialLoading: isPending,
    isRefreshing: isFetching && !isPending && !isFetchingNextPage,
    isFetchingNextPage,
    hasNextPage,
    isError: isError && pages.length === 0,
    error,
    hasNextPageError: isError && pages.length > 0,
    isEmpty: !isPending && !isError && articles.length === 0,
    fetchNextPage,
    refetch,
  };
}
