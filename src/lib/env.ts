/**
 * Single place where `import.meta.env` is read. Empty strings are treated as
 * "not configured" so a placeholder line in `.env` behaves like a missing key.
 */
function readKey(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

export const env = {
  newsApiKey: readKey(import.meta.env.VITE_NEWS_API_KEY),
  guardianApiKey: readKey(import.meta.env.VITE_GUARDIAN_API_KEY),
  nytApiKey: readKey(import.meta.env.VITE_NYT_API_KEY),
} as const;
