import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import NewspaperIcon from '@mui/icons-material/Newspaper';
import SettingsIcon from '@mui/icons-material/Settings';
import { NavLink, useLocation } from 'react-router';
import { Button } from '@/components/button';
import { SearchInput } from '@/features/filters/components/SearchInput';
import { useArticleFilters } from '@/features/filters/useArticleFilters';
import styles from './Header.module.css';

const FEED_ROUTES = ['/', '/for-you'];

const NAV_ITEMS = [
  { to: '/', label: 'All news', icon: NewspaperIcon },
  { to: '/for-you', label: 'For you', icon: AutoAwesomeIcon },
  { to: '/preferences', label: 'Preferences', icon: SettingsIcon },
] as const;

export function Header() {
  const { pathname } = useLocation();
  const { filters, setFilters } = useArticleFilters();
  const showSearch = FEED_ROUTES.includes(pathname);

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <NavLink to="/" className={styles.brand ?? ''}>
          <NewspaperIcon fontSize="small" aria-hidden="true" />
          <span className={styles.brandLabel}>News Hub</span>
        </NavLink>

        {showSearch && (
          // Wraps onto its own row below the navigation on small screens.
          <div className={styles.search}>
            <SearchInput
              value={filters.search}
              // Debounced updates should not fill the history stack.
              onCommit={(search) => setFilters({ search }, { replace: true })}
            />
          </div>
        )}

        <nav aria-label="Feeds" className={styles.nav}>
          {NAV_ITEMS.map((item) => (
            <Button
              key={item.to}
              component={NavLink}
              to={item.to}
              end={item.to === '/'}
              variant="ghost"
              size="sm"
              className={styles.navItem}
            >
              <item.icon fontSize="small" aria-hidden="true" />
              <span className={styles.navLabel}>{item.label}</span>
            </Button>
          ))}
        </nav>
      </div>
    </header>
  );
}
