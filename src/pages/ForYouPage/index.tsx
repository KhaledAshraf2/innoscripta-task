import SettingsIcon from '@mui/icons-material/Settings';
import { Link } from 'react-router';
import { Button } from '@/components/button';
import { CONFIGURED_PROVIDER_IDS } from '@/features/articles/api/providers';
import { FeedScreen } from '@/features/articles/components/FeedScreen';
import { matchesClientFilters } from '@/features/articles/helpers/matching';
import { useArticleFeed } from '@/features/articles/hooks/useArticleFeed';
import { buildArticleQuery } from '@/features/filters/searchParams';
import { useArticleFilters } from '@/features/filters/useArticleFilters';
import { matchesPreferences } from '@/features/preferences/applyPreferences';
import { usePreferences } from '@/features/preferences/PreferencesContext';
import styles from './ForYouPage.module.css';

export function ForYouPage() {
  const controller = useArticleFilters();
  const { preferences, hasAny } = usePreferences();

  const feed = useArticleFeed({
    query: buildArticleQuery({
      filters: controller.filters,
      availableProviders: CONFIGURED_PROVIDER_IDS,
      extraCategories: preferences.categories,
      extraSources: preferences.sources,
    }),
    refine: (article) =>
      matchesPreferences(article, preferences) &&
      matchesClientFilters(article, controller.filters),
  });

  if (!hasAny) {
    return (
      <div className={styles.empty}>
        <h1 className={styles.heading}>Your personalized feed is empty</h1>
        <p className={styles.lede}>
          Choose the categories, sources and authors you care about and they will show up here. Your
          choices stay in this browser.
        </p>
        <Button component={Link} to="/preferences">
          <SettingsIcon fontSize="small" />
          Choose your preferences
        </Button>
      </div>
    );
  }

  return (
    <FeedScreen
      heading="For you"
      description="Filtered by your saved categories, sources and authors."
      controller={controller}
      feed={feed}
    />
  );
}
