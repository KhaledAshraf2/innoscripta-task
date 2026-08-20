import CloseIcon from '@mui/icons-material/Close';
import { Button } from '@/components/button';
import { ARTICLE_CATEGORY_LABELS, PROVIDER_LABELS } from '@/features/articles/types';
import type { ArticleFilters } from '@/features/filters/searchParams';
import styles from './ActiveFilterSummary.module.css';

type ActiveChip = {
  key: string;
  label: string;
  clear: Partial<ArticleFilters>;
};

function toChips(filters: ArticleFilters): readonly ActiveChip[] {
  const chips: ActiveChip[] = [];

  if (filters.search) {
    chips.push({ key: 'search', label: `"${filters.search}"`, clear: { search: '' } });
  }
  if (filters.categories.length > 0) {
    for (const category of filters.categories) {
      chips.push({
        key: `category-${category}`,
        label: ARTICLE_CATEGORY_LABELS[category],
        clear: { categories: filters.categories.filter((item) => item !== category) },
      });
    }
  }
  if (filters.from) {
    chips.push({ key: 'from', label: `from ${filters.from}`, clear: { from: null } });
  }
  if (filters.to) {
    chips.push({ key: 'to', label: `to ${filters.to}`, clear: { to: null } });
  }
  if (filters.sources.length > 0) {
    for (const source of filters.sources) {
      chips.push({
        key: `source-${source}`,
        label: PROVIDER_LABELS[source],
        clear: { sources: filters.sources.filter((id) => id !== source) },
      });
    }
  }

  return chips;
}

type ActiveFilterSummaryProps = {
  filters: ArticleFilters;
  onClear: (patch: Partial<ArticleFilters>) => void;
};

/** Visible on small screens where the filter panel itself is hidden. */
export function ActiveFilterSummary({ filters, onClear }: ActiveFilterSummaryProps) {
  const chips = toChips(filters);
  if (chips.length === 0) return null;

  return (
    <ul aria-label="Active filters" className={styles.list}>
      {chips.map((chip) => (
        <li key={chip.key}>
          <Button type="button" variant="secondary" size="sm" onClick={() => onClear(chip.clear)}>
            <span className={styles.label}>{chip.label}</span>
            <CloseIcon sx={{ fontSize: 12 }} aria-hidden="true" />
            <span className="visuallyHidden">Remove filter</span>
          </Button>
        </li>
      ))}
    </ul>
  );
}
