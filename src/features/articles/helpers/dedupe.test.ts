import { describe, expect, it } from 'vitest';
import {
  canonicalizeUrl,
  dedupeArticles,
  sortByPublishedAtDesc,
} from '@/features/articles/helpers/dedupe';
import type { Article } from '@/features/articles/types';

function makeArticle(overrides: Partial<Article> = {}): Article {
  return {
    id: 'newsapi:1',
    url: 'https://example.com/story',
    title: 'A story',
    description: null,
    imageUrl: null,
    source: 'Example',
    author: null,
    category: null,
    publishedAt: '2026-02-01T10:00:00Z',
    provider: 'newsapi',
    ...overrides,
  };
}

describe('canonicalizeUrl', () => {
  it('ignores casing, www, trailing slashes and tracking parameters', () => {
    expect(canonicalizeUrl('https://WWW.Example.com/Story/?utm_source=x&id=7#top')).toBe(
      'example.com/story?id=7',
    );
  });

  it('treats http and https as the same article', () => {
    expect(canonicalizeUrl('http://example.com/story')).toBe(
      canonicalizeUrl('https://example.com/story'),
    );
  });

  it('returns null for values that are not URLs', () => {
    expect(canonicalizeUrl('not a url')).toBe(null);
  });
});

describe('dedupeArticles', () => {
  it('keeps the first article for a shared canonical url', () => {
    const articles = [
      makeArticle({ id: 'guardian:1', provider: 'guardian' }),
      makeArticle({ id: 'nyt:1', provider: 'nyt', url: 'https://www.example.com/story/?utm_a=1' }),
    ];

    const result = dedupeArticles(articles);

    expect(result).toHaveLength(1);
    expect(result[0]?.provider).toBe('guardian');
  });

  it('falls back to title and publication minute when the url is unusable', () => {
    const articles = [
      makeArticle({ id: 'a', url: 'invalid', title: 'Same  Story' }),
      makeArticle({ id: 'b', url: 'also invalid', title: 'same story' }),
      makeArticle({ id: 'c', url: 'invalid too', title: 'Other story' }),
    ];

    expect(dedupeArticles(articles)).toHaveLength(2);
  });

  it('does not mutate the input', () => {
    const articles = [makeArticle()];
    dedupeArticles(articles);
    expect(articles).toHaveLength(1);
  });
});

describe('sortByPublishedAtDesc', () => {
  it('orders newest first without mutating the source array', () => {
    const input = [
      makeArticle({ id: 'old', url: 'https://example.com/1', publishedAt: '2026-01-01T00:00:00Z' }),
      makeArticle({ id: 'new', url: 'https://example.com/2', publishedAt: '2026-03-01T00:00:00Z' }),
    ];

    expect(sortByPublishedAtDesc(input).map((article) => article.id)).toEqual(['new', 'old']);
    expect(input.map((article) => article.id)).toEqual(['old', 'new']);
  });
});
