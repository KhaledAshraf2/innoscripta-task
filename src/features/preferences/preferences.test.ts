import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Article } from '@/features/articles/types';
import { matchesPreferences } from '@/features/preferences/applyPreferences';
import {
  DEFAULT_PREFERENCES,
  parsePreferences,
  PREFERENCES_STORAGE_KEY,
  readPreferences,
  type Preferences,
} from '@/features/preferences/storage';

function makeArticle(overrides: Partial<Article> = {}): Article {
  return {
    id: 'newsapi:1',
    url: 'https://example.com/story',
    title: 'A story',
    description: null,
    imageUrl: null,
    source: 'Wired',
    author: 'Jane Doe',
    category: 'Technology',
    publishedAt: '2026-02-01T10:00:00Z',
    provider: 'newsapi',
    ...overrides,
  };
}

function makePreferences(overrides: Partial<Preferences> = {}): Preferences {
  return { ...DEFAULT_PREFERENCES, ...overrides };
}

function stubStorage(value: string | null): void {
  vi.stubGlobal('window', {
    localStorage: {
      getItem: (key: string) => (key === PREFERENCES_STORAGE_KEY ? value : null),
    },
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('parsePreferences', () => {
  it('accepts a valid payload and removes duplicates', () => {
    expect(
      parsePreferences({
        categories: ['technology', 'technology'],
        sources: ['newsapi', 'newsapi'],
        authors: [],
      }),
    ).toEqual({ categories: ['technology'], sources: ['newsapi'], authors: [] });
  });

  it('keeps valid providers and drops leftover names', () => {
    expect(
      parsePreferences({
        categories: [],
        sources: ['Wired', 'newsapi', 'not-a-provider'],
        authors: [],
      }),
    ).toEqual({ categories: [], sources: ['newsapi'], authors: [] });
  });

  it('falls back to defaults for unknown or malformed data', () => {
    expect(parsePreferences({ categories: ['aliens'], sources: [], authors: [] })).toEqual(
      DEFAULT_PREFERENCES,
    );
    expect(parsePreferences({ categories: 'technology' })).toEqual(DEFAULT_PREFERENCES);
    expect(parsePreferences(null)).toEqual(DEFAULT_PREFERENCES);
  });
});

describe('readPreferences', () => {
  it('recovers from stored JSON that cannot be parsed', () => {
    stubStorage('{not json');
    expect(readPreferences()).toEqual(DEFAULT_PREFERENCES);
  });

  it('recovers from stored JSON of an outdated shape', () => {
    stubStorage(JSON.stringify({ favouriteTopics: ['tech'] }));
    expect(readPreferences()).toEqual(DEFAULT_PREFERENCES);
  });

  it('returns defaults when nothing has been saved', () => {
    stubStorage(null);
    expect(readPreferences()).toEqual(DEFAULT_PREFERENCES);
  });

  it('reads a valid payload', () => {
    stubStorage(JSON.stringify({ categories: ['science'], sources: ['nyt'], authors: [] }));
    expect(readPreferences()).toEqual({ categories: ['science'], sources: ['nyt'], authors: [] });
  });
});

describe('matchesPreferences', () => {
  it('keeps everything when nothing is selected', () => {
    expect(matchesPreferences(makeArticle(), DEFAULT_PREFERENCES)).toBe(true);
  });

  it('matches provider section names through documented aliases', () => {
    const preferences = makePreferences({ categories: ['health'] });

    expect(matchesPreferences(makeArticle({ category: 'Society' }), preferences)).toBe(true);
    expect(matchesPreferences(makeArticle({ category: 'Sports' }), preferences)).toBe(false);
  });

  it('keeps articles whose category is unknown', () => {
    expect(
      matchesPreferences(makeArticle({ category: null }), makePreferences({ categories: ['health'] })),
    ).toBe(true);
  });

  it('matches preferred providers and authors', () => {
    expect(matchesPreferences(makeArticle(), makePreferences({ sources: ['newsapi'] }))).toBe(true);
    expect(matchesPreferences(makeArticle(), makePreferences({ sources: ['guardian'] }))).toBe(
      false,
    );
    expect(
      matchesPreferences(
        makeArticle({ author: 'By JANE DOE and John Roe' }),
        makePreferences({ authors: ['jane doe'] }),
      ),
    ).toBe(true);
  });

  it('uses union semantics so one empty dimension cannot hide the feed', () => {
    const preferences = makePreferences({ categories: ['sports'], authors: ['Jane Doe'] });

    // Category does not match, but the preferred author does.
    expect(matchesPreferences(makeArticle({ category: 'Technology' }), preferences)).toBe(true);
    expect(
      matchesPreferences(makeArticle({ category: 'Technology', author: 'Someone Else' }), preferences),
    ).toBe(false);
  });

  it('drops an excluded source even when another preference would keep it', () => {
    const preferences = makePreferences({
      categories: ['technology'],
      sources: ['guardian'],
    });

    expect(matchesPreferences(makeArticle({ provider: 'newsapi' }), preferences)).toBe(false);
    expect(matchesPreferences(makeArticle({ provider: 'guardian' }), preferences)).toBe(true);
  });
});
