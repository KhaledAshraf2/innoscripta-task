import { foldCase } from '@/features/articles/helpers/text';
import type { Article } from '@/features/articles/types';

const TRACKING_PARAM_PREFIXES = ['utm_', 'ito', 'cmp', 'smid', 'partner'];

/**
 * Two providers can expose the same story under slightly different URLs, so the
 * URL is canonicalized before it is used as an identity key.
 */
export function canonicalizeUrl(rawUrl: string): string | null {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return null;
  }

  const host = url.host.toLowerCase().replace(/^www\./, '');
  const path = url.pathname.replace(/\/+$/, '').toLowerCase();

  const params = new URLSearchParams();
  const keptKeys = [...url.searchParams.keys()]
    .filter((key) => !TRACKING_PARAM_PREFIXES.some((prefix) => key.toLowerCase().startsWith(prefix)))
    .sort();

  for (const key of keptKeys) {
    for (const value of url.searchParams.getAll(key)) params.append(key, value);
  }

  const search = params.toString();
  return `${host}${path}${search ? `?${search}` : ''}`;
}

/** Falls back to title plus publication minute when the URL is unusable. */
function dedupeKey(article: Article): string {
  const canonical = canonicalizeUrl(article.url);
  if (canonical) return `url:${canonical}`;

  const timestamp = Date.parse(article.publishedAt);
  const minute = Number.isNaN(timestamp) ? article.publishedAt : Math.floor(timestamp / 60_000);
  return `title:${foldCase(article.title)}|${minute}`;
}

/** Keeps the first occurrence of each key without mutating the input array. */
export function dedupeArticles(articles: readonly Article[]): readonly Article[] {
  const seen = new Set<string>();

  return articles.filter((article) => {
    const key = dedupeKey(article);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function sortByPublishedAtDesc(articles: readonly Article[]): readonly Article[] {
  return [...articles].sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));
}
