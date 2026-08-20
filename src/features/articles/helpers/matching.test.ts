import { describe, expect, it } from 'vitest';
import { matchesCategory, matchesClientFilters } from '@/features/articles/helpers/matching';
import type { Article } from '@/features/articles/types';

function makeArticle(overrides: Partial<Article> = {}): Article {
  return {
    id: 'guardian:1',
    url: 'https://example.com/story',
    title: 'A story',
    description: null,
    imageUrl: null,
    source: 'The Guardian',
    author: 'Jane Doe',
    category: 'Sport',
    publishedAt: '2026-02-01T10:00:00Z',
    provider: 'guardian',
    ...overrides,
  };
}

describe('matchesClientFilters', () => {
  it('keeps every article when no client filter is set', () => {
    expect(matchesClientFilters(makeArticle(), { categories: [], sources: [] })).toBe(true);
  });

  it('filters by provider id', () => {
    expect(matchesClientFilters(makeArticle(), { categories: [], sources: ['guardian'] })).toBe(
      true,
    );
    expect(matchesClientFilters(makeArticle(), { categories: [], sources: ['newsapi'] })).toBe(
      false,
    );
    expect(
      matchesClientFilters(makeArticle(), { categories: [], sources: ['newsapi', 'guardian'] }),
    ).toBe(true);
  });

  it('filters by category using provider section aliases', () => {
    expect(matchesClientFilters(makeArticle(), { categories: ['sports'], sources: [] })).toBe(true);
    expect(matchesClientFilters(makeArticle(), { categories: ['health'], sources: [] })).toBe(
      false,
    );
    expect(
      matchesClientFilters(makeArticle(), { categories: ['health', 'sports'], sources: [] }),
    ).toBe(true);
  });

  it('does not drop articles with an unknown category', () => {
    expect(
      matchesClientFilters(makeArticle({ category: null }), {
        categories: ['sports'],
        sources: [],
      }),
    ).toBe(true);
  });
});

describe('matchesCategory', () => {
  it('does not treat short aliases as substrings', () => {
    expect(matchesCategory(makeArticle({ category: 'Business Day' }), 'politics')).toBe(false);
    expect(matchesCategory(makeArticle({ category: 'Farewell' }), 'health')).toBe(false);
    expect(matchesCategory(makeArticle({ category: 'U.S.' }), 'politics')).toBe(true);
    expect(matchesCategory(makeArticle({ category: 'Society' }), 'health')).toBe(true);
  });
});
