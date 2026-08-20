import type { Article, ArticleQuery } from '@/features/articles/types';

export type ProviderPage = {
  articles: readonly Article[];
  hasMore: boolean;
};

export type FetchPageInput = {
  query: ArticleQuery;
  /** 1-based page number shared by all providers. */
  page: number;
  apiKey: string;
  signal: AbortSignal;
};

export type ProviderAdapter = {
  fetchPage: (input: FetchPageInput) => Promise<ProviderPage>;
};
