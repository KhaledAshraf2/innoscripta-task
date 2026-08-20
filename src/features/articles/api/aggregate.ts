import { getRunnableProviders } from '@/features/articles/api/providers';
import { dedupeArticles, sortByPublishedAtDesc } from '@/features/articles/helpers/dedupe';
import type {
  Article,
  ArticlePage,
  ArticleQuery,
  ProviderFailure,
} from '@/features/articles/types';
import { ApiError, isAbortError, isApiError } from '@/lib/http';

type AggregateInput = {
  query: ArticleQuery;
  page: number;
  signal: AbortSignal;
};

function toFailure(providerId: ProviderFailure['provider'], error: unknown): ProviderFailure {
  if (isApiError(error)) {
    return { provider: providerId, kind: error.kind, message: error.message };
  }

  return {
    provider: providerId,
    kind: 'provider',
    message: error instanceof Error ? error.message : 'Unknown provider error.',
  };
}

/**
 * Fetches every selected provider concurrently. A provider that fails is
 * reported alongside the data instead of failing the whole page; only a total
 * wipe-out rejects, which is what lets TanStack Query show a real error state.
 */
export async function aggregateArticles({
  query,
  page,
  signal,
}: AggregateInput): Promise<ArticlePage> {
  const providers = getRunnableProviders(query.providers);

  if (providers.length === 0) {
    return { articles: [], failures: [], hasMore: false };
  }

  const settled = await Promise.allSettled(
    providers.map((provider) => provider.adapter.fetchPage({ query, page, apiKey: provider.apiKey, signal })),
  );

  const collected: Article[] = [];
  const failures: ProviderFailure[] = [];
  let hasMore = false;

  settled.forEach((result, index) => {
    // `providers` and `settled` are built in the same order.
    const provider = providers[index];
    if (!provider) return;

    if (result.status === 'fulfilled') {
      collected.push(...result.value.articles);
      hasMore = hasMore || result.value.hasMore;
      return;
    }

    // An aborted page is a cancelled navigation, never a provider outage.
    if (isAbortError(result.reason)) throw result.reason;
    failures.push(toFailure(provider.id, result.reason));
  });

  if (failures.length === providers.length) {
    const [first] = failures;
    throw new ApiError({
      kind: first?.kind ?? 'provider',
      source: 'aggregate',
      message:
        providers.length === 1
          ? (first?.message ?? 'The news provider is unavailable.')
          : 'All news providers are currently unavailable.',
    });
  }

  return {
    articles: sortByPublishedAtDesc(dedupeArticles(collected)),
    failures,
    hasMore,
  };
}
