import { z } from 'zod';
import type {
  FetchPageInput,
  ProviderAdapter,
  ProviderPage,
} from '@/features/articles/api/providers/adapter';
import {
  cleanAuthor,
  nonEmpty,
  stripHtml,
} from '@/features/articles/helpers/text';
import type {
  Article,
  ArticleCategory,
  ArticleQuery,
} from '@/features/articles/types';
import { requestJson } from '@/lib/http';

const ENDPOINT = 'https://content.guardianapis.com/search';
const PAGE_SIZE = 20;

/** Normalized category -> Guardian section id. */
const SECTION_BY_CATEGORY: Record<ArticleCategory, string> = {
  general: 'news',
  world: 'world',
  politics: 'politics',
  business: 'business',
  technology: 'technology',
  science: 'science',
  health: 'society',
  sports: 'sport',
  entertainment: 'culture',
};

const guardianResultSchema = z.object({
  id: z.string().nullish(),
  sectionName: z.string().nullish(),
  webPublicationDate: z.string().nullish(),
  webTitle: z.string().nullish(),
  webUrl: z.string().nullish(),
  fields: z
    .object({
      trailText: z.string().nullish(),
      thumbnail: z.string().nullish(),
      byline: z.string().nullish(),
    })
    .nullish(),
  tags: z.array(z.object({ webTitle: z.string().nullish() })).nullish(),
});

export const guardianResponseSchema = z.object({
  response: z.object({
    status: z.string(),
    currentPage: z.number().nullish(),
    pages: z.number().nullish(),
    results: z.array(guardianResultSchema).nullish(),
  }),
});

export type GuardianResponse = z.infer<typeof guardianResponseSchema>;

export function buildGuardianUrl(
  query: ArticleQuery,
  page: number,
  apiKey: string,
): string {
  const params = new URLSearchParams({
    'api-key': apiKey,
    'order-by': 'newest',
    'page-size': String(PAGE_SIZE),
    page: String(page),
    'show-fields': 'trailText,thumbnail,byline',
    'show-tags': 'contributor',
  });

  if (query.search) params.set('q', query.search);
  if (query.from) params.set('from-date', query.from);
  if (query.to) params.set('to-date', query.to);
  if (query.categories.length > 0) {
    // The Guardian treats "|" as OR inside the section parameter.
    params.set(
      'section',
      query.categories
        .map((category) => SECTION_BY_CATEGORY[category])
        .join('|'),
    );
  }

  return `${ENDPOINT}?${params.toString()}`;
}

export function mapGuardianResponse(raw: GuardianResponse): readonly Article[] {
  return (raw.response.results ?? []).flatMap((item): Article[] => {
    const url = nonEmpty(item.webUrl);
    const title = nonEmpty(item.webTitle);
    const publishedAt = nonEmpty(item.webPublicationDate);

    if (!url || !title || !publishedAt) return [];

    const contributor = item.tags?.find(
      (tag) => nonEmpty(tag.webTitle) !== null,
    )?.webTitle;
    const trailText = nonEmpty(item.fields?.trailText);

    return [
      {
        id: `guardian:${nonEmpty(item.id) ?? url}`,
        url,
        title: stripHtml(title),
        description: trailText ? stripHtml(trailText) : null,
        imageUrl: nonEmpty(item.fields?.thumbnail),
        source: 'The Guardian',
        author: cleanAuthor(item.fields?.byline) ?? cleanAuthor(contributor),
        category: nonEmpty(item.sectionName),
        publishedAt,
        provider: 'guardian',
      },
    ];
  });
}

async function fetchPage({
  query,
  page,
  apiKey,
  signal,
}: FetchPageInput): Promise<ProviderPage> {
  const raw = await requestJson({
    url: buildGuardianUrl(query, page, apiKey),
    schema: guardianResponseSchema,
    source: 'guardian',
    signal,
  });

  return {
    articles: mapGuardianResponse(raw),
    hasMore: page < (raw.response.pages ?? 0),
  };
}

export const guardianAdapter: ProviderAdapter = {
  id: 'guardian',
  fetchPage,
};
