import { z } from 'zod';
import {
  ARTICLE_CATEGORIES,
  PROVIDER_IDS,
  type ArticleCategory,
  type ArticleQuery,
  type ProviderId,
} from '@/features/articles/types';

/** Filters as they exist in the URL. This is the app's single source of truth. */
export type ArticleFilters = {
  search: string;
  categories: readonly ArticleCategory[];
  /** `yyyy-MM-dd` or null. */
  from: string | null;
  to: string | null;
  sources: readonly ProviderId[];
};

export const DEFAULT_FILTERS: ArticleFilters = {
  search: '',
  categories: [],
  from: null,
  to: null,
  sources: [],
};

const SEARCH_PARAM_KEYS = {
  search: 'q',
  category: 'category',
  from: 'from',
  to: 'to',
  source: 'source',
} as const;

/** Local calendar date as `yyyy-MM-dd`. UTC `toISOString()` is wrong near midnight. */
export function toLocalIsoDate(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Rejects overflow dates such as 31 February, which `Date.parse` would accept. */
export function isCalendarDate(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const utc = new Date(Date.UTC(year, month - 1, day));

  return (
    utc.getUTCFullYear() === year && utc.getUTCMonth() === month - 1 && utc.getUTCDate() === day
  );
}

const isoDateSchema = z.string().refine(isCalendarDate, 'Not a real calendar date');

const categorySchema = z.enum(ARTICLE_CATEGORIES);
const providerSchema = z.enum(PROVIDER_IDS);

function parseOptional<T>(schema: z.ZodType<T>, value: string | null): T | null {
  if (value === null) return null;
  const result = schema.safeParse(value);
  return result.success ? result.data : null;
}

function parseEnumList<T extends string>(
  params: URLSearchParams,
  key: string,
  schema: z.ZodType<T>,
  order: readonly T[],
): readonly T[] {
  const selected = new Set(
    params.getAll(key).flatMap((value) =>
      value.split(',').flatMap((part) => {
        const parsed = schema.safeParse(part.trim());
        return parsed.success ? [parsed.data] : [];
      }),
    ),
  );

  return order.filter((item) => selected.has(item));
}

/** Collapses internal whitespace so " ai   news " and "ai news" share a cache entry. */
export function normalizeSearch(value: string): string {
  return value.trim().replace(/\s+/g, ' ');
}

/**
 * The only place URL strings are interpreted. Anything unrecognized is dropped
 * rather than propagated, so a hand-edited URL cannot break the feed.
 */
export function parseFilters(params: URLSearchParams): ArticleFilters {
  return {
    search: normalizeSearch(params.get(SEARCH_PARAM_KEYS.search) ?? ''),
    categories: parseEnumList(
      params,
      SEARCH_PARAM_KEYS.category,
      categorySchema,
      ARTICLE_CATEGORIES,
    ),
    from: parseOptional(isoDateSchema, params.get(SEARCH_PARAM_KEYS.from)),
    to: parseOptional(isoDateSchema, params.get(SEARCH_PARAM_KEYS.to)),
    sources: parseEnumList(params, SEARCH_PARAM_KEYS.source, providerSchema, PROVIDER_IDS),
  };
}

/** Defaults are omitted so shared links stay readable. */
export function serializeFilters(filters: ArticleFilters): URLSearchParams {
  const params = new URLSearchParams();

  if (filters.search) params.set(SEARCH_PARAM_KEYS.search, filters.search);
  for (const category of ARTICLE_CATEGORIES.filter((item) => filters.categories.includes(item))) {
    params.append(SEARCH_PARAM_KEYS.category, category);
  }
  if (filters.from) params.set(SEARCH_PARAM_KEYS.from, filters.from);
  if (filters.to) params.set(SEARCH_PARAM_KEYS.to, filters.to);
  for (const source of PROVIDER_IDS.filter((id) => filters.sources.includes(id))) {
    params.append(SEARCH_PARAM_KEYS.source, source);
  }

  return params;
}

export function isDateRangeValid(filters: ArticleFilters): boolean {
  if (!filters.from || !filters.to) return true;
  return filters.from <= filters.to;
}

export function countActiveFilters(filters: ArticleFilters): number {
  return (
    Number(filters.categories.length > 0) +
    Number(filters.from !== null) +
    Number(filters.to !== null) +
    Number(filters.sources.length > 0)
  );
}

type BuildQueryInput = {
  filters: ArticleFilters;
  availableProviders: readonly ProviderId[];
  /** Used only when the user has not picked a category filter. */
  extraCategories?: readonly ArticleCategory[];
  /** Preferred sources for For you; ignored when the URL already names sources. */
  extraSources?: readonly ProviderId[];
};

/** Translates URL filters into the server-relevant query used by the adapters. */
export function buildArticleQuery({
  filters,
  availableProviders,
  extraCategories = [],
  extraSources = [],
}: BuildQueryInput): ArticleQuery {
  const selected = new Set(filters.categories.length > 0 ? filters.categories : extraCategories);
  const rangeIsValid = isDateRangeValid(filters);
  const preferred = extraSources.filter((id) => availableProviders.includes(id));
  const scope = preferred.length > 0 ? preferred : availableProviders;
  const configuredSources = filters.sources.filter((id) => availableProviders.includes(id));
  const requested = configuredSources.filter((id) => scope.includes(id));
  const providers = configuredSources.length > 0 ? requested : scope;

  return {
    search: filters.search,
    categories: ARTICLE_CATEGORIES.filter((category) => selected.has(category)),
    from: rangeIsValid ? filters.from : null,
    to: rangeIsValid ? filters.to : null,
    providers,
  };
}
