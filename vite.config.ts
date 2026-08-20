import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

// NewsAPI rejects browser requests from non-localhost origins, so it is always
// called through a same-origin path. nginx mirrors this proxy in the container.
const newsApiProxy = {
  '/proxy/newsapi': {
    target: 'https://newsapi.org',
    changeOrigin: true,
    rewrite: (path: string) => path.replace(/^\/proxy\/newsapi/, ''),
  },
};

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 9000,
    proxy: newsApiProxy,
  },
  preview: {
    port: 9100,
    proxy: newsApiProxy,
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
