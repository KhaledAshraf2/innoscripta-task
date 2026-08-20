import TuneIcon from '@mui/icons-material/Tune';
import type { ComponentProps } from 'react';
import { Badge } from '@/components/badge';
import { Button } from '@/components/button';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/sheet';
import { FilterPanel } from '@/features/filters/components/FilterPanel';
import styles from './MobileFilterSheet.module.css';

type MobileFilterSheetProps = ComponentProps<typeof FilterPanel>;

export function MobileFilterSheet(props: MobileFilterSheetProps) {
  return (
    <Sheet>
      <SheetTrigger>
        <Button type="button" variant="outline" size="sm" className={styles.trigger}>
          <TuneIcon fontSize="small" />
          Filters
          {props.activeFilterCount > 0 && (
            <Badge variant="secondary" className={styles.count}>
              {props.activeFilterCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          {/* The panel below carries the visible heading, but the dialog still
              needs an accessible name. */}
          <SheetTitle className="visuallyHidden">Filters</SheetTitle>
          <SheetDescription>Narrow the feed by categories, date or sources.</SheetDescription>
        </SheetHeader>
        <div className={styles.body}>
          <FilterPanel {...props} />
        </div>
        <SheetFooter>
          <SheetClose>
            <Button type="button">Show results</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
