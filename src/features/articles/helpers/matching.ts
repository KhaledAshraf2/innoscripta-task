import { foldCase } from '@/features/articles/helpers/text';
import type { Article, ArticleCategory, ProviderId } from '@/features/articles/types';

/**
 * Providers label sections with their own vocabulary ("society", "Business
 * Day", "Arts"), so normalized categories carry a documented alias list that is
 * matched case- and accent-insensitively.
 */
const CATEGORY_ALIASES: Record<ArticleCategory, readonly string[]> = {
  general: ['general', 'news', 'home'],
  world: ['world', 'international', 'global'],
  politics: ['politics', 'u.s.', 'us', 'election'],
  business: ['business', 'business day', 'economy', 'money', 'markets'],
  technology: ['technology', 'tech'],
  science: ['science', 'environment', 'climate'],
  health: ['health', 'society', 'well', 'wellness'],
  sports: ['sports', 'sport', 'football', 'soccer'],
  entertainment: [
    'entertainment',
    'culture',
    'arts',
    'movies',
    'books',
    'theater',
    'music',
  ],
};

function looselyIncludes(haystack: string, needle: string): boolean {
  return (
    haystack === needle ||
    haystack.includes(needle) ||
    needle.includes(haystack)
  );
}

export function matchesCategory(
  article: Article,
  category: ArticleCategory,
): boolean {
  if (article.category === null) return false;
  const folded = foldCase(article.category);
  return CATEGORY_ALIASES[category].some((alias) =>
    looselyIncludes(folded, alias),
  );
}

/** Bylines list several people, so a preferred author only has to appear. */
export function matchesAuthor(article: Article, author: string): boolean {
  if (article.author === null) return false;
  return foldCase(article.author).includes(foldCase(author));
}

export function matchesClientFilters(
  article: Article,
  filters: { categories: readonly ArticleCategory[]; sources: readonly ProviderId[] },
): boolean {
  if (filters.sources.length > 0 && !filters.sources.includes(article.provider)) return false;
  if (
    filters.categories.length > 0 &&
    article.category !== null &&
    !filters.categories.some((category) => matchesCategory(article, category))
  ) {
    return false;
  }
  return true;
}
