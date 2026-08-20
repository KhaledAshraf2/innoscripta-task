import { describe, expect, it } from 'vitest';
import {
  buildGuardianUrl,
  guardianResponseSchema,
  mapGuardianResponse,
} from '@/features/articles/api/providers/guardian';
import type { ArticleQuery } from '@/features/articles/types';

const baseQuery: ArticleQuery = {
  search: '',
  categories: [],
  from: null,
  to: null,
  providers: ['guardian'],
};

describe('buildGuardianUrl', () => {
  it('translates normalized filters into Guardian parameters', () => {
    const params = new URL(
      buildGuardianUrl(
        {
          ...baseQuery,
          search: 'climate',
          categories: ['health', 'sports'],
          from: '2026-01-01',
          to: '2026-02-01',
        },
        2,
        'guardian-key',
      ),
      'http://x',
    ).searchParams;

    expect(params.get('q')).toBe('climate');
    expect(params.get('section')).toBe('society|sport');
    expect(params.get('from-date')).toBe('2026-01-01');
    expect(params.get('to-date')).toBe('2026-02-01');
    expect(params.get('page')).toBe('2');
    expect(params.get('api-key')).toBe('guardian-key');
    expect(params.get('order-by')).toBe('newest');
  });

  it('omits parameters that are not set', () => {
    const params = new URL(buildGuardianUrl(baseQuery, 1, 'k'), 'http://x').searchParams;

    expect(params.has('q')).toBe(false);
    expect(params.has('section')).toBe(false);
    expect(params.has('from-date')).toBe(false);
  });
});

describe('mapGuardianResponse', () => {
  it('strips HTML from the trail text and cleans the byline', () => {
    const raw = guardianResponseSchema.parse({
      response: {
        status: 'ok',
        currentPage: 1,
        pages: 4,
        results: [
          {
            id: 'society/2026/feb/01/nhs',
            sectionName: 'Society',
            webPublicationDate: '2026-02-01T08:30:00Z',
            webTitle: 'NHS &amp; funding',
            webUrl: 'https://theguardian.com/society/nhs',
            fields: {
              trailText: '<p>A <strong>long</strong> read</p>',
              thumbnail: 'https://media.guim.co.uk/thumb.jpg',
              byline: 'By John Roe',
            },
            tags: [{ webTitle: 'Someone Else' }],
          },
        ],
      },
    });

    expect(mapGuardianResponse(raw)).toEqual([
      {
        id: 'guardian:society/2026/feb/01/nhs',
        url: 'https://theguardian.com/society/nhs',
        title: 'NHS & funding',
        description: 'A long read',
        imageUrl: 'https://media.guim.co.uk/thumb.jpg',
        source: 'The Guardian',
        author: 'John Roe',
        category: 'Society',
        publishedAt: '2026-02-01T08:30:00Z',
        provider: 'guardian',
      },
    ]);
  });

  it('falls back to the contributor tag when there is no byline', () => {
    const raw = guardianResponseSchema.parse({
      response: {
        status: 'ok',
        results: [
          {
            id: 'x',
            webPublicationDate: '2026-02-01T08:30:00Z',
            webTitle: 'Title',
            webUrl: 'https://theguardian.com/x',
            tags: [{ webTitle: 'Ada Lovelace' }],
          },
        ],
      },
    });

    expect(mapGuardianResponse(raw)[0]?.author).toBe('Ada Lovelace');
  });

  it('returns nothing when results are absent', () => {
    const raw = guardianResponseSchema.parse({ response: { status: 'ok' } });
    expect(mapGuardianResponse(raw)).toEqual([]);
  });
});
