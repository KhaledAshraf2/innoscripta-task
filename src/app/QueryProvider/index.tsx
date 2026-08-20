import { QueryClientProvider } from '@tanstack/react-query';
import { type ReactNode, useState } from 'react';
import { createQueryClient } from './queryClient';

export function QueryProvider({ children }: { children: ReactNode }) {
  // One client per app instance, created lazily so StrictMode's double render
  // does not throw away a warm cache.
  const [queryClient] = useState(createQueryClient);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
