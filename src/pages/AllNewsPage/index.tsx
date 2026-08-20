import { CONFIGURED_PROVIDER_IDS } from '@/features/articles/api/providers';
import { FeedScreen } from '@/features/articles/components/FeedScreen';
import { matchesClientFilters } from '@/features/articles/helpers/matching';
import { useArticleFeed } from '@/features/articles/hooks/useArticleFeed';
import { buildArticleQuery } from '@/features/filters/searchParams';
import { useArticleFilters } from '@/features/filters/useArticleFilters';

export function AllNewsPage() {
  const controller = useArticleFilters();

  const feed = useArticleFeed({
    query: buildArticleQuery({
      filters: controller.filters,
      availableProviders: CONFIGURED_PROVIDER_IDS,
    }),
    refine: (article) => matchesClientFilters(article, controller.filters),
  });

  return (
    <FeedScreen
      heading="All news"
      description="Everything from your configured providers, newest first."
      controller={controller}
      feed={feed}
    />
  );
}
