import type { ProviderAdapter } from '@/features/articles/api/providers/adapter';
import { guardianAdapter } from '@/features/articles/api/providers/guardian';
import { newsApiAdapter } from '@/features/articles/api/providers/newsapi';
import { nytAdapter } from '@/features/articles/api/providers/nyt';
import { PROVIDER_IDS, type ProviderId } from '@/features/articles/types';
import { env } from '@/lib/env';

type ProviderConfig = {
  envVar: string;
  /** Shown in the setup notice so a missing key is self-explanatory. */
  docsUrl: string;
  apiKey: string | undefined;
  adapter: ProviderAdapter;
};

const CONFIGS: Record<ProviderId, ProviderConfig> = {
  newsapi: {
    envVar: 'VITE_NEWS_API_KEY',
    docsUrl: 'https://newsapi.org/register',
    apiKey: env.newsApiKey,
    adapter: newsApiAdapter,
  },
  guardian: {
    envVar: 'VITE_GUARDIAN_API_KEY',
    docsUrl: 'https://open-platform.theguardian.com/access/',
    apiKey: env.guardianApiKey,
    adapter: guardianAdapter,
  },
  nyt: {
    envVar: 'VITE_NYT_API_KEY',
    docsUrl: 'https://developer.nytimes.com/get-started',
    apiKey: env.nytApiKey,
    adapter: nytAdapter,
  },
};

/** A provider without a key is skipped entirely instead of failing the feed. */
export const CONFIGURED_PROVIDER_IDS: readonly ProviderId[] = PROVIDER_IDS.filter(
  (id) => CONFIGS[id].apiKey !== undefined,
);

export const UNCONFIGURED_PROVIDERS = PROVIDER_IDS.flatMap((id) => {
  const config = CONFIGS[id];
  return config.apiKey === undefined
    ? [{ id, envVar: config.envVar, docsUrl: config.docsUrl }]
    : [];
});

type RunnableProvider = {
  id: ProviderId;
  apiKey: string;
  adapter: ProviderAdapter;
};

export function getRunnableProviders(
  requested: readonly ProviderId[],
): readonly RunnableProvider[] {
  return requested.flatMap((id) => {
    const config = CONFIGS[id];
    return config.apiKey === undefined
      ? []
      : [{ id, apiKey: config.apiKey, adapter: config.adapter }];
  });
}
