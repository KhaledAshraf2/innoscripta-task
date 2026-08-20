import { z } from 'zod';
import type { FetchPageInput, ProviderAdapter, ProviderPage } from '@/features/articles/api/providers/adapter';
import { cleanAuthor, nonEmpty } from '@/features/articles/helpers/text';
import type { Article, ArticleCategory, ArticleQuery } from '@/features/articles/types';
import { requestJson } from '@/lib/http';

const ENDPOINT = 'https://api.nytimes.com/svc/search/v2/articlesearch.json';
/** Article Search returns a fixed 10 documents per page and caps at page 100. */
const PAGE_SIZE = 10;
const MAX_PAGE = 100;
const IMAGE_BASE_URL = 'https://static01.nyt.com/';

/** Normalized category -> NYT `section_name` facet value. */
const SECTION_BY_CATEGORY: Record<ArticleCategory, string | null> = {
  general: null,
  world: 'World',
  politics: 'U.S.',
  business: 'Business Day',
  technology: 'Technology',
  science: 'Science',
  health: 'Health',
  sports: 'Sports',
  entertainment: 'Arts',
};

/**
 * `multimedia` has shipped as both an array of assets and a keyed object, so
 * both shapes are accepted rather than trusting one.
 */
const nytMultimediaSchema = z.union([
  z.array(z.object({ url: z.string().nullish() })),
  z.object({
    default: z.object({ url: z.string().nullish() }).nullish(),
    thumbnail: z.object({ url: z.string().nullish() }).nullish(),
  }),
]);

const nytDocSchema = z.object({
  _id: z.string().nullish(),
  web_url: z.string().nullish(),
  headline: z.object({ main: z.string().nullish() }).nullish(),
  abstract: z.string().nullish(),
  snippet: z.string().nullish(),
  lead_paragraph: z.string().nullish(),
  source: z.string().nullish(),
  byline: z.object({ original: z.string().nullish() }).nullish(),
  section_name: z.string().nullish(),
  pub_date: z.string().nullish(),
  multimedia: nytMultimediaSchema.nullish(),
});

export const nytResponseSchema = z.object({
  status: z.string().nullish(),
  response: z.object({
    docs: z.array(nytDocSchema).nullish(),
    meta: z.object({ hits: z.number().nullish() }).nullish(),
  }),
});

export type NytResponse = z.infer<typeof nytResponseSchema>;

type NytDoc = z.infer<typeof nytDocSchema>;

function toCompactDate(date: string): string {
  return date.replaceAll('-', '');
}

export function buildNytUrl(query: ArticleQuery, page: number, apiKey: string): string {
  const params = new URLSearchParams({
    'api-key': apiKey,
    sort: 'newest',
    // NYT pages are zero-based while the app counts from one.
    page: String(page - 1),
  });

  if (query.search) params.set('q', query.search);
  if (query.from) params.set('begin_date', toCompactDate(query.from));
  if (query.to) params.set('end_date', toCompactDate(query.to));

  const sections = query.categories
    .map((category) => SECTION_BY_CATEGORY[category])
    .filter((section): section is string => section !== null);

  if (sections.length > 0) {
    params.set('fq', `section_name:(${sections.map((section) => `"${section}"`).join(' ')})`);
  }

  return `${ENDPOINT}?${params.toString()}`;
}

function resolveImageUrl(multimedia: NytDoc['multimedia']): string | null {
  if (!multimedia) return null;

  const path = Array.isArray(multimedia)
    ? multimedia.find((asset) => nonEmpty(asset.url) !== null)?.url
    : (multimedia.default?.url ?? multimedia.thumbnail?.url);

  const url = nonEmpty(path);
  if (!url) return null;

  return url.startsWith('http') ? url : `${IMAGE_BASE_URL}${url.replace(/^\//, '')}`;
}

export function mapNytResponse(raw: NytResponse): readonly Article[] {
  return (raw.response.docs ?? []).flatMap((doc): Article[] => {
    const url = nonEmpty(doc.web_url);
    const title = nonEmpty(doc.headline?.main);
    const publishedAt = nonEmpty(doc.pub_date);

    if (!url || !title || !publishedAt) return [];

    return [
      {
        id: `nyt:${nonEmpty(doc._id) ?? url}`,
        url,
        title,
        description: nonEmpty(doc.abstract) ?? nonEmpty(doc.snippet) ?? nonEmpty(doc.lead_paragraph),
        imageUrl: resolveImageUrl(doc.multimedia),
        source: nonEmpty(doc.source) ?? 'The New York Times',
        author: cleanAuthor(doc.byline?.original),
        category: nonEmpty(doc.section_name),
        publishedAt,
        provider: 'nyt',
      },
    ];
  });
}

async function fetchPage({ query, page, apiKey, signal }: FetchPageInput): Promise<ProviderPage> {
  const raw = await requestJson({
    url: buildNytUrl(query, page, apiKey),
    schema: nytResponseSchema,
    source: 'nyt',
    signal,
  });

  const docCount = raw.response.docs?.length ?? 0;

  return {
    articles: mapNytResponse(raw),
    hasMore: docCount === PAGE_SIZE && page < MAX_PAGE,
  };
}

export const nytAdapter: ProviderAdapter = {
  id: 'nyt',
  fetchPage,
};
