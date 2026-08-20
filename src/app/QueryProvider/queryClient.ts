import { QueryClient } from '@tanstack/react-query';
import { isRetryableApiError } from '@/lib/http';

const MAX_RETRIES = 2;

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: (failureCount, error) =>
          failureCount < MAX_RETRIES && isRetryableApiError(error),
        retryDelay: (attempt) => Math.min(1_000 * 2 ** attempt, 4_000),
      },
    },
  });
}
