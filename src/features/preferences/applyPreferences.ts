import { matchesAuthor, matchesCategory } from '@/features/articles/helpers/matching';
import type { Article } from '@/features/articles/types';
import { hasPreferences, type Preferences } from '@/features/preferences/storage';

/**
 * Preferred sources are a hard filter: an excluded provider never stays on the
 * For you feed. Categories and authors stay a union so one empty dimension
 * cannot hide everything else.
 *
 * NewsAPI has no category, so a missing category is skipped rather than treated
 * as a match. That way an author filter still applies to those articles.
 */
export function matchesPreferences(article: Article, preferences: Preferences): boolean {
  if (!hasPreferences(preferences)) return true;

  if (preferences.sources.length > 0 && !preferences.sources.includes(article.provider)) {
    return false;
  }

  const signals: boolean[] = [];

  if (preferences.categories.length > 0 && article.category !== null) {
    signals.push(preferences.categories.some((category) => matchesCategory(article, category)));
  }

  if (preferences.authors.length > 0) {
    signals.push(preferences.authors.some((author) => matchesAuthor(article, author)));
  }

  return signals.length === 0 || signals.some((matched) => matched);
}
