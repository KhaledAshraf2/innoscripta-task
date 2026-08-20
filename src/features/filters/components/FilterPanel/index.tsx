import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { useId } from 'react';
import { Button } from '@/components/button';
import { Input } from '@/components/input';
import { Label } from '@/components/label';
import { CategoryMultiSelect } from '@/features/articles/components/CategoryMultiSelect';
import { SourceMultiSelect } from '@/features/articles/components/SourceMultiSelect';
import type { FilterPanelProps } from '@/features/filters/useArticleFilters';
import styles from './FilterPanel.module.css';

export function FilterPanel({
  filters,
  setFilters,
  clearAll,
  activeFilterCount,
  dateRangeError,
}: FilterPanelProps) {
  const fieldId = useId();
  const categoryId = `${fieldId}-category`;
  const fromId = `${fieldId}-from`;
  const toId = `${fieldId}-to`;
  const sourceId = `${fieldId}-source`;
  const dateErrorId = `${fieldId}-date-error`;
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className={styles.panel}>
      <div className={styles.headingRow}>
        <h2 className={styles.heading}>Filters</h2>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={clearAll}
          disabled={activeFilterCount === 0 && filters.search === ''}
        >
          <RestartAltIcon fontSize="small" />
          Clear all
        </Button>
      </div>

      <div className={styles.field}>
        <Label htmlFor={categoryId}>Categories</Label>
        <CategoryMultiSelect
          id={categoryId}
          value={filters.categories}
          onValueChange={(categories) => setFilters({ categories })}
        />
      </div>

      <fieldset className={styles.field}>
        <legend className={styles.legend}>Published between</legend>
        <div className={styles.dates}>
          <div className={styles.dateField}>
            <Label htmlFor={fromId} className={styles.mutedLabel}>
              From
            </Label>
            <Input
              id={fromId}
              type="date"
              max={filters.to ?? today}
              value={filters.from ?? ''}
              onChange={(event) => setFilters({ from: event.target.value || null })}
              aria-invalid={dateRangeError !== null}
              {...(dateRangeError ? { 'aria-describedby': dateErrorId } : {})}
            />
          </div>
          <div className={styles.dateField}>
            <Label htmlFor={toId} className={styles.mutedLabel}>
              To
            </Label>
            <Input
              id={toId}
              type="date"
              {...(filters.from ? { min: filters.from } : {})}
              max={today}
              value={filters.to ?? ''}
              onChange={(event) => setFilters({ to: event.target.value || null })}
              aria-invalid={dateRangeError !== null}
              {...(dateRangeError ? { 'aria-describedby': dateErrorId } : {})}
            />
          </div>
        </div>
        {dateRangeError && (
          <p id={dateErrorId} role="alert" className={styles.error}>
            {dateRangeError}
          </p>
        )}
      </fieldset>

      <div className={styles.field}>
        <Label htmlFor={sourceId}>Sources</Label>
        <SourceMultiSelect
          id={sourceId}
          value={filters.sources}
          onValueChange={(sources) => setFilters({ sources })}
        />
      </div>
    </div>
  );
}
