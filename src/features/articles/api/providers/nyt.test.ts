import { describe, expect, it } from 'vitest';
import { buildNytUrl, mapNytResponse, nytResponseSchema } from '@/features/articles/api/providers/nyt';
import type { ArticleQuery } from '@/features/articles/types';

const baseQuery: ArticleQuery = {
  search: '',
  categories: [],
  from: null,
  to: null,
  providers: ['nyt'],
};

describe('buildNytUrl', () => {
  it('converts to zero-based paging and compact dates', () => {
    const params = new URL(
      buildNytUrl({ ...baseQuery, from: '2026-01-05', to: '2026-01-09' }, 1, 'secret'),
    ).searchParams;

    expect(params.get('page')).toBe('0');
    expect(params.get('begin_date')).toBe('20260105');
    expect(params.get('end_date')).toBe('20260109');
  });

  it('builds a quoted section facet and skips categories without a mapping', () => {
    const params = new URL(
      buildNytUrl({ ...baseQuery, categories: ['business', 'general'] }, 2, 'secret'),
    ).searchParams;

    expect(params.get('fq')).toBe('section_name:("Business Day")');
    expect(params.get('page')).toBe('1');
  });

  it('omits the facet when no category maps to a section', () => {
    const params = new URL(buildNytUrl({ ...baseQuery, categories: ['general'] }, 1, 'k'))
      .searchParams;
    expect(params.has('fq')).toBe(false);
  });
});

describe('mapNytResponse', () => {
  it('prefixes relative image paths from the legacy array shape', () => {
    const raw = nytResponseSchema.parse({
      response: {
        docs: [
          {
            _id: 'nyt://article/1',
            web_url: 'https://nytimes.com/2026/02/01/tech.html',
            headline: { main: 'A headline' },
            abstract: 'An abstract.',
            byline: { original: 'By Ada Lovelace' },
            section_name: 'Technology',
            pub_date: '2026-02-01T12:00:00+0000',
            multimedia: [{ url: 'images/2026/02/01/tech.jpg' }],
          },
        ],
      },
    });

    expect(mapNytResponse(raw)[0]).toEqual({
      id: 'nyt:nyt://article/1',
      url: 'https://nytimes.com/2026/02/01/tech.html',
      title: 'A headline',
      description: 'An abstract.',
      imageUrl: 'https://static01.nyt.com/images/2026/02/01/tech.jpg',
      source: 'The New York Times',
      author: 'Ada Lovelace',
      category: 'Technology',
      publishedAt: '2026-02-01T12:00:00+0000',
      provider: 'nyt',
    });
  });

  it('accepts the keyed multimedia object shape and absolute urls', () => {
    const raw = nytResponseSchema.parse({
      response: {
        docs: [
          {
            web_url: 'https://nytimes.com/a',
            headline: { main: 'Title' },
            pub_date: '2026-02-01T12:00:00+0000',
            multimedia: { default: { url: 'https://static01.nyt.com/a.jpg' } },
          },
        ],
      },
    });

    expect(mapNytResponse(raw)[0]?.imageUrl).toBe('https://static01.nyt.com/a.jpg');
  });

  it('falls back through abstract, snippet and lead paragraph', () => {
    const raw = nytResponseSchema.parse({
      response: {
        docs: [
          {
            web_url: 'https://nytimes.com/b',
            headline: { main: 'Title' },
            pub_date: '2026-02-01T12:00:00+0000',
            snippet: 'A snippet.',
          },
        ],
      },
    });

    expect(mapNytResponse(raw)[0]?.description).toBe('A snippet.');
    expect(mapNytResponse(raw)[0]?.imageUrl).toBe(null);
  });
});
