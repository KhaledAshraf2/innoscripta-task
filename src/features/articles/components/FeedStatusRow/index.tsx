import { Button } from '@/components/button';
import styles from './FeedStatusRow.module.css';

type FeedStatusRowProps = {
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  hasError: boolean;
  onRetry: () => unknown;
};

/** Rendered as the last row of the feed. */
export function FeedStatusRow({
  isFetchingNextPage,
  hasNextPage,
  hasError,
  onRetry,
}: FeedStatusRowProps) {
  if (hasError) {
    return (
      <div className={styles.error}>
        <p role="alert">Could not load more articles.</p>
        <Button type="button" variant="outline" size="sm" onClick={onRetry}>
          Try again
        </Button>
      </div>
    );
  }

  if (isFetchingNextPage) {
    return (
      <p className={styles.message} aria-live="polite">
        Loading more articles...
      </p>
    );
  }

  if (hasNextPage) {
    return (
      <div className={styles.center}>
        <Button type="button" variant="outline" size="sm" onClick={onRetry}>
          Load more
        </Button>
      </div>
    );
  }

  return <p className={styles.message}>You have reached the end of the results.</p>;
}
