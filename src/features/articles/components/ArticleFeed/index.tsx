import { useEffect, useRef } from 'react';
import { ArticleCard } from '@/features/articles/components/ArticleCard';
import { FeedStatusRow } from '@/features/articles/components/FeedStatusRow';
import type { ArticleFeed as ArticleFeedState } from '@/features/articles/hooks/useArticleFeed';
import styles from './ArticleFeed.module.css';

type ArticleFeedProps = {
  feed: ArticleFeedState;
};

export function ArticleFeed({ feed }: ArticleFeedProps) {
  const sentinelRef = useRef<HTMLLIElement>(null);
  const { articles, hasNextPage, isFetchingNextPage, isRefreshing, hasNextPageError, fetchNextPage } =
    feed;
  const canLoadMore = hasNextPage && !isFetchingNextPage && !isRefreshing && !hasNextPageError;

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !canLoadMore) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) fetchNextPage();
      },
      { rootMargin: '400px' },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [canLoadMore, fetchNextPage]);

  return (
    <div className={styles.scroller} tabIndex={-1}>
      <ul aria-label="Articles" aria-busy={isFetchingNextPage} className={styles.list}>
        {articles.map((article) => (
          <li key={article.id}>
            <ArticleCard article={article} />
          </li>
        ))}
        <li ref={sentinelRef}>
          <FeedStatusRow
            isFetchingNextPage={isFetchingNextPage}
            hasNextPage={hasNextPage}
            hasError={hasNextPageError}
            onRetry={fetchNextPage}
          />
        </li>
      </ul>
    </div>
  );
}
