import { describe, expect, it } from 'vitest';
import {
  buildNewsApiUrl,
  mapNewsApiResponse,
  newsApiResponseSchema,
} from '@/features/articles/api/providers/newsapi';
import type { ArticleQuery } from '@/features/articles/types';

const baseQuery: ArticleQuery = {
  search: '',
  categories: [],
  from: null,
  to: null,
  providers: ['newsapi'],
};

describe('buildNewsApiUrl', () => {
  it('encodes the search term and paging', () => {
    const params = new URL(buildNewsApiUrl({ ...baseQuery, search: 'ai & chips' }, 3), 'http://x')
      .searchParams;

    expect(params.get('q')).toBe('ai & chips');
    expect(params.get('page')).toBe('3');
    expect(params.get('pageSize')).toBe('20');
    expect(params.get('sortBy')).toBe('publishedAt');
  });

  it('falls back to categories, then to a default query', () => {
    const withCategories = new URL(
      buildNewsApiUrl({ ...baseQuery, categories: ['technology', 'health'] }, 1),
      'http://x',
    ).searchParams;
    expect(withCategories.get('q')).toBe('technology OR health');

    const empty = new URL(buildNewsApiUrl(baseQuery, 1), 'http://x').searchParams;
    expect(empty.get('q')).toBe('news');
  });

  it('keeps the search term when a category is also selected', () => {
    const params = new URL(
      buildNewsApiUrl({ ...baseQuery, search: 'climate', categories: ['technology'] }, 1),
      'http://x',
    ).searchParams;

    expect(params.get('q')).toBe('climate (technology)');
  });

  it('makes the "to" date inclusive', () => {
    const params = new URL(
      buildNewsApiUrl({ ...baseQuery, from: '2026-01-01', to: '2026-01-31' }, 1),
      'http://x',
    ).searchParams;

    expect(params.get('from')).toBe('2026-01-01');
    expect(params.get('to')).toBe('2026-01-31T23:59:59');
  });
});

describe('mapNewsApiResponse', () => {
  it('normalizes a well-formed article', () => {
    const raw = newsApiResponseSchema.parse({
      status: 'ok',
      totalResults: 1,
      articles: [
        {
          source: { id: 'wired', name: 'Wired' },
          author: 'By Jane Doe',
          title: 'Chips get faster',
          description: 'A story about chips.',
          url: 'https://wired.com/chips',
          urlToImage: 'https://wired.com/chips.jpg',
          publishedAt: '2026-02-01T10:00:00Z',
        },
      ],
    });

    expect(mapNewsApiResponse(raw)).toEqual([
      {
        id: 'newsapi:https://wired.com/chips',
        url: 'https://wired.com/chips',
        title: 'Chips get faster',
        description: 'A story about chips.',
        imageUrl: 'https://wired.com/chips.jpg',
        source: 'Wired',
        author: 'Jane Doe',
        category: null,
        publishedAt: '2026-02-01T10:00:00Z',
        provider: 'newsapi',
      },
    ]);
  });

  it('drops removed and incomplete entries instead of failing', () => {
    const raw = newsApiResponseSchema.parse({
      status: 'ok',
      articles: [
        { title: '[Removed]', url: 'https://a.com/1', publishedAt: '2026-02-01T10:00:00Z' },
        { title: 'No url', publishedAt: '2026-02-01T10:00:00Z' },
        { title: 'No date', url: 'https://a.com/2' },
        { title: null, url: null, publishedAt: null },
      ],
    });

    expect(mapNewsApiResponse(raw)).toEqual([]);
  });

  it('tolerates a missing articles array', () => {
    expect(mapNewsApiResponse(newsApiResponseSchema.parse({ status: 'ok' }))).toEqual([]);
  });
});
