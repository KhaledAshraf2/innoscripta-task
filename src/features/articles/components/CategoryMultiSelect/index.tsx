import { MultiSelect } from '@/components/select';
import {
  ARTICLE_CATEGORIES,
  ARTICLE_CATEGORY_LABELS,
  type ArticleCategory,
} from '@/features/articles/types';

type CategoryMultiSelectProps = {
  id?: string;
  value: readonly ArticleCategory[];
  onValueChange: (categories: readonly ArticleCategory[]) => void;
};

export function CategoryMultiSelect({ id, value, onValueChange }: CategoryMultiSelectProps) {
  return (
    <MultiSelect
      aria-label="Categories"
      value={[...value]}
      placeholder="Any category"
      options={ARTICLE_CATEGORIES.map((category) => ({
        value: category,
        label: ARTICLE_CATEGORY_LABELS[category],
      }))}
      onValueChange={(next) =>
        onValueChange(ARTICLE_CATEGORIES.filter((category) => next.includes(category)))
      }
      {...(id !== undefined ? { id } : {})}
    />
  );
}
