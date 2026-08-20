import type { Article, ArticleQuery, ProviderId } from '@/features/articles/types';

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
  id: ProviderId;
  fetchPage: (input: FetchPageInput) => Promise<ProviderPage>;
};
