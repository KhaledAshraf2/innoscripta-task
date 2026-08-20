import useMediaQuery from '@mui/material/useMediaQuery';
import { CONFIGURED_PROVIDER_IDS } from '@/features/articles/api/providers';
import { ArticleFeed } from '@/features/articles/components/ArticleFeed';
import {
  PartialFailureNotice,
  ProviderSetupNotice,
  RefreshingIndicator,
} from '@/features/articles/components/FeedNotices';
import {
  FeedEmptyState,
  FeedErrorState,
  NoProvidersState,
} from '@/features/articles/components/FeedPlaceholder';
import { FeedSkeleton } from '@/features/articles/components/FeedSkeleton';
import type { ArticleFeed as ArticleFeedState } from '@/features/articles/hooks/useArticleFeed';
import { ActiveFilterSummary } from '@/features/filters/components/ActiveFilterSummary';
import { FilterPanel } from '@/features/filters/components/FilterPanel';
import { MobileFilterSheet } from '@/features/filters/components/MobileFilterSheet';
import type {
  ArticleFiltersController,
  FilterPanelProps,
} from '@/features/filters/useArticleFilters';
import styles from './FeedScreen.module.css';

type FeedScreenProps = {
  heading: string;
  description: string;
  controller: ArticleFiltersController;
  feed: ArticleFeedState;
};

export function FeedScreen({ heading, description, controller, feed }: FeedScreenProps) {
  const isDesktop = useMediaQuery('(min-width: 1024px)', { noSsr: true });
  const { filters, setFilters, clearAll, activeFilterCount, dateRangeError } = controller;
  const filterProps: FilterPanelProps = {
    filters,
    setFilters,
    clearAll,
    activeFilterCount,
    dateRangeError,
  };

  return (
    <div className={styles.layout}>
      {isDesktop ? (
        <aside className={styles.aside} aria-label="Filters">
          <FilterPanel {...filterProps} />
        </aside>
      ) : null}

      <section className={styles.main}>
        <div className={styles.headingRow}>
          <div>
            <h1 className={styles.heading}>{heading}</h1>
            <p className={styles.description}>{description}</p>
          </div>
          <div className={styles.actions}>
            <RefreshingIndicator isRefreshing={feed.isRefreshing} />
            {isDesktop ? null : <MobileFilterSheet {...filterProps} />}
          </div>
        </div>

        <ActiveFilterSummary filters={filters} onClear={setFilters} />
        <ProviderSetupNotice />
        <PartialFailureNotice failures={feed.failures} />

        <FeedContent feed={feed} onClearFilters={clearAll} />
      </section>
    </div>
  );
}

function FeedContent({
  feed,
  onClearFilters,
}: {
  feed: ArticleFeedState;
  onClearFilters: () => void;
}) {
  if (CONFIGURED_PROVIDER_IDS.length === 0) return <NoProvidersState />;
  if (feed.isInitialLoading) return <FeedSkeleton />;

  if (feed.isError) {
    return (
      <FeedErrorState
        message={feed.error?.message ?? 'The request failed unexpectedly.'}
        onRetry={feed.refetch}
      />
    );
  }

  if (feed.isEmpty) {
    return <FeedEmptyState onClearFilters={onClearFilters} />;
  }

  return (
    <>
      {feed.hiddenCount > 0 && (
        <p className={styles.hiddenCount}>
          {feed.hiddenCount} loaded {feed.hiddenCount === 1 ? 'article is' : 'articles are'} hidden
          by the current filters.
        </p>
      )}
      <ArticleFeed feed={feed} />
    </>
  );
}
