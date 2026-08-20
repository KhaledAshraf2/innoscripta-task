import type { ProviderAdapter } from '@/features/articles/api/providers/adapter';
import { guardianAdapter } from '@/features/articles/api/providers/guardian';
import { newsApiAdapter } from '@/features/articles/api/providers/newsapi';
import { nytAdapter } from '@/features/articles/api/providers/nyt';
import {
  PROVIDER_IDS,
  PROVIDER_LABELS,
  type ProviderId,
} from '@/features/articles/types';
import { env } from '@/lib/env';

export type ProviderConfig = {
  id: ProviderId;
  label: string;
  envVar: string;
  /** Shown in the setup notice so a missing key is self-explanatory. */
  docsUrl: string;
  apiKey: string | undefined;
  adapter: ProviderAdapter;
};

const CONFIGS: Record<ProviderId, ProviderConfig> = {
  newsapi: {
    id: 'newsapi',
    label: PROVIDER_LABELS.newsapi,
    envVar: 'VITE_NEWS_API_KEY',
    docsUrl: 'https://newsapi.org/register',
    apiKey: env.newsApiKey,
    adapter: newsApiAdapter,
  },
  guardian: {
    id: 'guardian',
    label: PROVIDER_LABELS.guardian,
    envVar: 'VITE_GUARDIAN_API_KEY',
    docsUrl: 'https://open-platform.theguardian.com/access/',
    apiKey: env.guardianApiKey,
    adapter: guardianAdapter,
  },
  nyt: {
    id: 'nyt',
    label: PROVIDER_LABELS.nyt,
    envVar: 'VITE_NYT_API_KEY',
    docsUrl: 'https://developer.nytimes.com/get-started',
    apiKey: env.nytApiKey,
    adapter: nytAdapter,
  },
};

export const PROVIDER_CONFIGS: readonly ProviderConfig[] = PROVIDER_IDS.map(
  (id) => CONFIGS[id],
);

/** A provider without a key is skipped entirely instead of failing the feed. */
export const CONFIGURED_PROVIDER_IDS: readonly ProviderId[] =
  PROVIDER_CONFIGS.filter((config) => config.apiKey !== undefined).map(
    (config) => config.id,
  );

export const UNCONFIGURED_PROVIDERS: readonly ProviderConfig[] =
  PROVIDER_CONFIGS.filter((config) => config.apiKey === undefined);

export type RunnableProvider = ProviderConfig & { apiKey: string };

export function getRunnableProviders(
  requested: readonly ProviderId[],
): readonly RunnableProvider[] {
  return requested.flatMap((id) => {
    const config = CONFIGS[id];
    return config.apiKey === undefined
      ? []
      : [{ ...config, apiKey: config.apiKey }];
  });
}
