import { Alert, AlertDescription, AlertTitle } from '@/components/alert';
import { UNCONFIGURED_PROVIDERS } from '@/features/articles/api/providers';
import { PROVIDER_LABELS, type ProviderFailure } from '@/features/articles/types';
import styles from './FeedNotices.module.css';

/**
 * Partial failures are non-blocking: successful providers stay on screen and
 * this only explains what is missing.
 */
export function PartialFailureNotice({ failures }: { failures: readonly ProviderFailure[] }) {
  if (failures.length === 0) return null;

  return (
    <Alert variant="warning">
      <AlertTitle>Some sources are unavailable</AlertTitle>
      <AlertDescription>
        <ul>
          {failures.map((failure) => (
            <li key={failure.provider}>
              <span className={styles.strong}>{PROVIDER_LABELS[failure.provider]}</span>:{' '}
              {failure.message}
            </li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  );
}

/** Development-friendly explanation of which API keys are missing. */
export function ProviderSetupNotice() {
  if (UNCONFIGURED_PROVIDERS.length === 0) return null;

  return (
    <Alert>
      <AlertTitle>
        {UNCONFIGURED_PROVIDERS.length === 1
          ? '1 provider is not configured'
          : `${UNCONFIGURED_PROVIDERS.length} providers are not configured`}
      </AlertTitle>
      <AlertDescription>
        <p>Add the keys below to your .env file and restart the dev server.</p>
        <ul>
          {UNCONFIGURED_PROVIDERS.map((provider) => (
            <li key={provider.id}>
              <code className={styles.code}>{provider.envVar}</code> for{' '}
              {PROVIDER_LABELS[provider.id]} —{' '}
              <a
                href={provider.docsUrl}
                target="_blank"
                rel="noreferrer noopener"
                className={styles.link}
              >
                get a key
              </a>
            </li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  );
}

/** Shown while data already on screen is being revalidated. */
export function RefreshingIndicator({ isRefreshing }: { isRefreshing: boolean }) {
  return (
    <p aria-live="polite" className={styles.refreshing}>
      {isRefreshing ? 'Refreshing...' : ''}
    </p>
  );
}
