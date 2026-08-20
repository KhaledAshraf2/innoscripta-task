import { QueryClient } from '@tanstack/react-query';
import { isRetryableApiError } from '@/lib/http';

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: (failureCount, error) => failureCount < 1 && isRetryableApiError(error),
      },
    },
  });
}
