/** Guardian trail text arrives as an HTML fragment; cards render plain text. */
export function stripHtml(value: string): string {
  return value
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Case- and accent-insensitive comparison key used for author/source matching
 * and for title-based deduplication fallbacks.
 */
export function foldCase(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

/** Byline strings differ per provider: "By Jane Doe", "Jane Doe and John Roe". */
export function cleanAuthor(value: string | null | undefined): string | null {
  if (!value) return null;
  const cleaned = stripHtml(value).replace(/^by\s+/i, '').trim();
  return cleaned.length > 0 ? cleaned : null;
}

export function nonEmpty(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : null;
}
