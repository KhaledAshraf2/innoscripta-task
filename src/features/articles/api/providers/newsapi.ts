import { z } from 'zod';
import type { FetchPageInput, ProviderAdapter, ProviderPage } from '@/features/articles/api/providers/adapter';
import { cleanAuthor, nonEmpty } from '@/features/articles/helpers/text';
import type { Article, ArticleQuery } from '@/features/articles/types';
import { rejectUnlessProviderOk, requestJson } from '@/lib/http';

/**
 * NewsAPI blocks cross-origin browser requests, so it is always called through
 * a same-origin proxy path (Vite dev server and nginx both forward it).
 */
const ENDPOINT = '/proxy/newsapi/v2/everything';
const PAGE_SIZE = 20;
/** `/v2/everything` rejects requests without a query, so an empty search needs one. */
const FALLBACK_QUERY = 'news';
/** NewsAPI marks purged items with this literal title. */
const REMOVED_TITLE = '[Removed]';

const newsApiArticleSchema = z.object({
  source: z.object({ name: z.string().nullish() }).nullish(),
  author: z.string().nullish(),
  title: z.string().nullish(),
  description: z.string().nullish(),
  url: z.string().nullish(),
  urlToImage: z.string().nullish(),
  publishedAt: z.string().nullish(),
});

export const newsApiResponseSchema = z.object({
  status: z.string(),
  code: z.string().nullish(),
  message: z.string().nullish(),
  totalResults: z.number().nullish(),
  articles: z.array(newsApiArticleSchema).nullish(),
});

type NewsApiResponse = z.infer<typeof newsApiResponseSchema>;

function newsApiQuery(query: ArticleQuery): string {
  const categories = query.categories.join(' OR ');
  if (query.search && categories) return `${query.search} (${categories})`;
  return query.search || categories || FALLBACK_QUERY;
}

export function buildNewsApiUrl(query: ArticleQuery, page: number): string {
  const params = new URLSearchParams({
    // `/v2/everything` has no category facet, so sections become keywords.
    q: newsApiQuery(query),
    language: 'en',
    sortBy: 'publishedAt',
    pageSize: String(PAGE_SIZE),
    page: String(page),
  });

  if (query.from) params.set('from', query.from);
  if (query.to) params.set('to', `${query.to}T23:59:59`);

  return `${ENDPOINT}?${params.toString()}`;
}

export function mapNewsApiResponse(raw: NewsApiResponse): readonly Article[] {
  return (raw.articles ?? []).flatMap((item): Article[] => {
    const url = nonEmpty(item.url);
    const title = nonEmpty(item.title);
    const publishedAt = nonEmpty(item.publishedAt);

    if (!url || !title || !publishedAt || title === REMOVED_TITLE) return [];

    return [
      {
        id: `newsapi:${url}`,
        url,
        title,
        description: nonEmpty(item.description),
        imageUrl: nonEmpty(item.urlToImage),
        source: nonEmpty(item.source?.name) ?? 'NewsAPI',
        author: cleanAuthor(item.author),
        category: null,
        publishedAt,
        provider: 'newsapi',
      },
    ];
  });
}

async function fetchPage({ query, page, apiKey, signal }: FetchPageInput): Promise<ProviderPage> {
  const raw = await requestJson({
    url: buildNewsApiUrl(query, page),
    schema: newsApiResponseSchema,
    signal,
    headers: { 'X-Api-Key': apiKey },
  });

  rejectUnlessProviderOk(raw.status, 'ok', raw.message);

  const articles = mapNewsApiResponse(raw);
  const total = raw.totalResults ?? 0;

  return { articles, hasMore: page * PAGE_SIZE < total };
}

export const newsApiAdapter: ProviderAdapter = {
  fetchPage,
};
