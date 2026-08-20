import { format, formatDistanceToNowStrict, isValid, parseISO } from 'date-fns';

const RECENT_THRESHOLD_MS = 24 * 60 * 60 * 1000;

/** "3 hours ago" while fresh, then an absolute date for older articles. */
export function formatPublishedAt(isoDate: string): string {
  const date = parseISO(isoDate);
  if (!isValid(date)) return 'Unknown date';

  const age = Date.now() - date.getTime();
  if (age >= 0 && age < RECENT_THRESHOLD_MS) {
    return `${formatDistanceToNowStrict(date)} ago`;
  }

  return format(date, 'd MMM yyyy');
}

export function toDateTimeAttribute(isoDate: string): string | undefined {
  const date = parseISO(isoDate);
  return isValid(date) ? date.toISOString() : undefined;
}
