import { z } from 'zod';
import {
  ARTICLE_CATEGORIES,
  PROVIDER_IDS,
  type ArticleCategory,
  type ProviderId,
} from '@/features/articles/types';

/** Bump the version when the shape changes; older payloads are discarded. */
const STORAGE_KEY = 'news-aggregator:preferences:v1';
const MAX_ENTRIES = 50;

export type Preferences = {
  categories: readonly ArticleCategory[];
  sources: readonly ProviderId[];
  authors: readonly string[];
};

export const DEFAULT_PREFERENCES: Preferences = {
  categories: [],
  sources: [],
  authors: [],
};

const nameListSchema = z
  .array(z.string().trim().min(1))
  .max(MAX_ENTRIES)
  .transform((values) => [...new Set(values)]);

const preferencesSchema = z.object({
  categories: z.array(z.enum(ARTICLE_CATEGORIES)).transform((values) => [...new Set(values)]),
  sources: z
    .array(z.string())
    .max(MAX_ENTRIES)
    .transform((values) => [
      ...new Set(values.filter((value): value is ProviderId => PROVIDER_IDS.includes(value as ProviderId))),
    ]),
  authors: nameListSchema,
});

/**
 * Stored JSON is untrusted: anything that fails validation falls back to the
 * defaults instead of crashing the app on load.
 */
export function parsePreferences(value: unknown): Preferences {
  const parsed = preferencesSchema.safeParse(value);
  return parsed.success ? parsed.data : DEFAULT_PREFERENCES;
}

export function readPreferences(): Preferences {
  let raw: string | null;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    // Private browsing modes can throw on access.
    return DEFAULT_PREFERENCES;
  }

  if (raw === null) return DEFAULT_PREFERENCES;

  try {
    return parsePreferences(JSON.parse(raw));
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export function writePreferences(preferences: Preferences): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  } catch {
    // Storage being unavailable must not break the session.
  }
}

export function clearPreferences(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing to recover from: in-memory state remains the source of truth.
  }
}

export function hasPreferences(preferences: Preferences): boolean {
  return (
    preferences.categories.length > 0 ||
    preferences.sources.length > 0 ||
    preferences.authors.length > 0
  );
}

export const PREFERENCES_STORAGE_KEY = STORAGE_KEY;
