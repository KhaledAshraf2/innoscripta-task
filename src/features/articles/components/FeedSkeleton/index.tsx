import { Card, CardContent } from '@/components/card';
import { Skeleton } from '@/components/skeleton';
import styles from './FeedSkeleton.module.css';

const PLACEHOLDER_COUNT = 6;

export function FeedSkeleton() {
  return (
    <output className={styles.list} aria-live="polite" aria-label="Loading articles">
      {Array.from({ length: PLACEHOLDER_COUNT }, (_, index) => (
        <Card key={index} className={styles.card}>
          <Skeleton className={styles.thumb} />
          <CardContent className={styles.content}>
            <Skeleton className={styles.meta} />
            <Skeleton className={styles.line} />
            <Skeleton className={styles.lineShort} />
            <Skeleton className={styles.excerpt} />
          </CardContent>
        </Card>
      ))}
    </output>
  );
}
