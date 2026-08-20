import TuneIcon from '@mui/icons-material/Tune';
import { Badge } from '@/components/badge';
import { Button } from '@/components/button';
import { Sheet } from '@/components/sheet';
import { FilterPanel } from '@/features/filters/components/FilterPanel';
import type { FilterPanelProps } from '@/features/filters/useArticleFilters';
import styles from './MobileFilterSheet.module.css';

export function MobileFilterSheet(props: FilterPanelProps) {
  return (
    <Sheet
      trigger={
        <Button type="button" variant="outline" size="sm">
          <TuneIcon fontSize="small" />
          Filters
          {props.activeFilterCount > 0 && (
            <Badge variant="secondary" className={styles.count}>
              {props.activeFilterCount}
            </Badge>
          )}
        </Button>
      }
      title="Filters"
      titleClassName="visuallyHidden"
      description="Narrow the feed by categories, date or sources."
    >
      <div className={styles.body}>
        <FilterPanel {...props} />
      </div>
    </Sheet>
  );
}
