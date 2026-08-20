import type { ApiErrorKind } from '@/lib/http';

export const PROVIDER_IDS = ['newsapi', 'guardian', 'nyt'] as const;

export type ProviderId = (typeof PROVIDER_IDS)[number];

export const PROVIDER_LABELS: Record<ProviderId, string> = {
  newsapi: 'NewsAPI',
  guardian: 'The Guardian',
  nyt: 'The New York Times',
};

/**
 * Categories are a normalized vocabulary owned by this app. Each adapter maps
 * them onto whatever taxonomy its provider happens to use.
 */
export const ARTICLE_CATEGORIES = [
  'general',
  'world',
  'politics',
  'business',
  'technology',
  'science',
  'health',
  'sports',
  'entertainment',
] as const;

export type ArticleCategory = (typeof ARTICLE_CATEGORIES)[number];

export const ARTICLE_CATEGORY_LABELS: Record<ArticleCategory, string> = {
  general: 'General',
  world: 'World',
  politics: 'Politics',
  business: 'Business',
  technology: 'Technology',
  science: 'Science',
  health: 'Health',
  sports: 'Sports',
  entertainment: 'Entertainment',
};

/** Normalized article. No provider-specific field ever reaches a component. */
export type Article = {
  id: string;
  url: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  source: string;
  author: string | null;
  category: string | null;
  /** ISO-8601 timestamp. */
  publishedAt: string;
  provider: ProviderId;
};

/** Server-relevant query, i.e. everything that belongs in the query key. */
export type ArticleQuery = {
  search: string;
  categories: readonly ArticleCategory[];
  /** `yyyy-MM-dd`, inclusive. */
  from: string | null;
  to: string | null;
  providers: readonly ProviderId[];
};

export type ProviderFailure = {
  provider: ProviderId;
  kind: ApiErrorKind;
  message: string;
};

export type ArticlePage = {
  articles: readonly Article[];
  /** Providers that failed for this page; kept apart from article data. */
  failures: readonly ProviderFailure[];
  hasMore: boolean;
};
