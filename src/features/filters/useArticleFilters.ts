import { useSearchParams } from 'react-router';
import {
  countActiveFilters,
  isDateRangeValid,
  parseFilters,
  serializeFilters,
  type ArticleFilters,
} from '@/features/filters/searchParams';

type SetFiltersOptions = {
  /** Debounced updates replace history instead of stacking entries. */
  replace?: boolean;
};

export type ArticleFiltersController = {
  filters: ArticleFilters;
  setFilters: (patch: Partial<ArticleFilters>, options?: SetFiltersOptions) => void;
  clearAll: () => void;
  activeFilterCount: number;
  dateRangeError: string | null;
};

export function useArticleFilters(): ArticleFiltersController {
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = parseFilters(searchParams);

  return {
    filters,
    setFilters: (patch, options) => {
      setSearchParams(serializeFilters({ ...filters, ...patch }), {
        replace: options?.replace ?? false,
      });
    },
    clearAll: () => setSearchParams(new URLSearchParams()),
    activeFilterCount: countActiveFilters(filters),
    dateRangeError: isDateRangeValid(filters)
      ? null
      : 'The "from" date is after the "to" date, so the date range is ignored.',
  };
}
