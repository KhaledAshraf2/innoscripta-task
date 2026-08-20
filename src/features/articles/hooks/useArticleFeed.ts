import { useEffect } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { articleFeedQueryOptions } from '@/features/articles/queries';
import { dedupeArticles, sortByPublishedAtDesc } from '@/features/articles/helpers/dedupe';
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

/** Stop auto-filling after this many pages so a rare author cannot hammer rate limits. */
const AUTO_FILL_PAGE_LIMIT = 8;

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
  const loaded = sortByPublishedAtDesc(dedupeArticles(pages.flatMap((page) => page.articles)));
  const articles = refine ? loaded.filter(refine) : loaded;
  const stillFilling = articles.length === 0 && hasNextPage && pages.length < AUTO_FILL_PAGE_LIMIT;

  useEffect(() => {
    if (isPending || isFetching || isError || !stillFilling) return;
    void fetchNextPage();
  }, [isPending, isFetching, isError, stillFilling, fetchNextPage]);

  // Failures are per page; the newest page reflects the current provider state.
  const failures = pages.at(-1)?.failures ?? [];

  return {
    articles,
    hiddenCount: loaded.length - articles.length,
    failures,
    isInitialLoading: isPending || (articles.length === 0 && isFetchingNextPage),
    isRefreshing: isFetching && !isPending && !isFetchingNextPage,
    isFetchingNextPage,
    hasNextPage,
    isError: isError && pages.length === 0,
    error,
    hasNextPageError: isError && pages.length > 0,
    isEmpty: !isPending && !isError && articles.length === 0 && !stillFilling && !isFetchingNextPage,
    fetchNextPage,
    refetch,
  };
}
