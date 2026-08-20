import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ProviderPage } from '@/features/articles/api/providers/adapter';
import type { Article, ArticleQuery, ProviderId } from '@/features/articles/types';
import { ApiError } from '@/lib/http';

const { getRunnableProviders } = vi.hoisted(() => ({ getRunnableProviders: vi.fn() }));

vi.mock('@/features/articles/api/providers', () => ({ getRunnableProviders }));

const { aggregateArticles } = await import('@/features/articles/api/aggregate');

const query: ArticleQuery = {
  search: '',
  categories: [],
  from: null,
  to: null,
  providers: ['newsapi', 'guardian', 'nyt'],
};

function makeArticle(provider: ProviderId, overrides: Partial<Article> = {}): Article {
  return {
    id: `${provider}:1`,
    url: `https://example.com/${provider}`,
    title: `Story from ${provider}`,
    description: null,
    imageUrl: null,
    source: provider,
    author: null,
    category: null,
    publishedAt: '2026-02-01T10:00:00Z',
    provider,
    ...overrides,
  };
}

type FakeProvider = {
  id: ProviderId;
  result: Promise<ProviderPage>;
};

function mockProviders(providers: readonly FakeProvider[]): void {
  getRunnableProviders.mockReturnValue(
    providers.map((provider) => ({
      id: provider.id,
      apiKey: 'test-key',
      adapter: { fetchPage: () => provider.result },
    })),
  );
}

beforeEach(() => {
  getRunnableProviders.mockReset();
});

describe('aggregateArticles', () => {
  it('merges, deduplicates and sorts articles from every provider', async () => {
    const shared = 'https://example.com/shared';
    mockProviders([
      {
        id: 'guardian',
        result: Promise.resolve({
          articles: [
            makeArticle('guardian', { url: shared, publishedAt: '2026-02-01T09:00:00Z' }),
            makeArticle('guardian', {
              id: 'guardian:2',
              url: 'https://example.com/g2',
              publishedAt: '2026-02-03T09:00:00Z',
            }),
          ],
          hasMore: false,
        }),
      },
      {
        id: 'nyt',
        result: Promise.resolve({
          articles: [
            makeArticle('nyt', { url: `${shared}?utm_source=nl`, publishedAt: '2026-02-02T09:00:00Z' }),
          ],
          hasMore: true,
        }),
      },
    ]);

    const page = await aggregateArticles({ query, page: 1, signal: new AbortController().signal });

    expect(page.articles.map((article) => article.url)).toEqual([
      'https://example.com/g2',
      shared,
    ]);
    expect(page.failures).toEqual([]);
    expect(page.hasMore).toBe(true);
  });

  it('reports a failing provider while keeping the successful ones', async () => {
    mockProviders([
      {
        id: 'guardian',
        result: Promise.resolve({ articles: [makeArticle('guardian')], hasMore: false }),
      },
      {
        id: 'newsapi',
        result: Promise.reject(
          new ApiError({ kind: 'rate_limit', message: 'Rate limit reached.' }),
        ),
      },
    ]);

    const page = await aggregateArticles({ query, page: 1, signal: new AbortController().signal });

    expect(page.articles).toHaveLength(1);
    expect(page.failures).toEqual([
      { provider: 'newsapi', kind: 'rate_limit', message: 'Rate limit reached.' },
    ]);
  });

  it('rejects only when every provider fails', async () => {
    mockProviders([
      {
        id: 'guardian',
        result: Promise.reject(new ApiError({ kind: 'network', message: 'Offline.' })),
      },
      {
        id: 'nyt',
        result: Promise.reject(new ApiError({ kind: 'network', message: 'Offline.' })),
      },
    ]);

    await expect(
      aggregateArticles({ query, page: 1, signal: new AbortController().signal }),
    ).rejects.toThrow('All news providers are currently unavailable.');
  });

  it('keeps the feed going when a provider hits its result cap', async () => {
    mockProviders([
      {
        id: 'guardian',
        result: Promise.resolve({ articles: [makeArticle('guardian')], hasMore: true }),
      },
      {
        id: 'newsapi',
        result: Promise.reject(
          new ApiError({
            kind: 'result_limit',
            message: 'This provider has no more results on the current plan.',
          }),
        ),
      },
    ]);

    const page = await aggregateArticles({ query, page: 6, signal: new AbortController().signal });

    expect(page.articles).toHaveLength(1);
    expect(page.hasMore).toBe(true);
    expect(page.failures).toEqual([
      {
        provider: 'newsapi',
        kind: 'result_limit',
        message: 'This provider has no more results on the current plan.',
      },
    ]);
  });

  it('does not fail the page when the only provider has hit its result cap', async () => {
    mockProviders([
      {
        id: 'newsapi',
        result: Promise.reject(
          new ApiError({
            kind: 'result_limit',
            message: 'This provider has no more results on the current plan.',
          }),
        ),
      },
    ]);

    await expect(
      aggregateArticles({ query, page: 6, signal: new AbortController().signal }),
    ).resolves.toEqual({
      articles: [],
      hasMore: false,
      failures: [
        {
          provider: 'newsapi',
          kind: 'result_limit',
          message: 'This provider has no more results on the current plan.',
        },
      ],
    });
  });

  it('returns an empty page when no provider is configured', async () => {
    mockProviders([]);

    await expect(
      aggregateArticles({ query, page: 1, signal: new AbortController().signal }),
    ).resolves.toEqual({ articles: [], failures: [], hasMore: false });
  });
});
