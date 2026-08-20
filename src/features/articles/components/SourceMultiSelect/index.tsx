import { MultiSelect } from '@/components/select';
import { CONFIGURED_PROVIDER_IDS } from '@/features/articles/api/providers';
import { PROVIDER_IDS, PROVIDER_LABELS, type ProviderId } from '@/features/articles/types';

type SourceMultiSelectProps = {
  id?: string;
  value: readonly ProviderId[];
  onValueChange: (sources: readonly ProviderId[]) => void;
};

/** Shared by feed filters and preferences so the source list stays in one place. */
export function SourceMultiSelect({ id, value, onValueChange }: SourceMultiSelectProps) {
  return (
    <MultiSelect
      aria-label="Sources"
      value={value.filter((item) => CONFIGURED_PROVIDER_IDS.includes(item))}
      placeholder="Any source"
      options={CONFIGURED_PROVIDER_IDS.map((providerId) => ({
        value: providerId,
        label: PROVIDER_LABELS[providerId],
      }))}
      onValueChange={(next) => onValueChange(PROVIDER_IDS.filter((item) => next.includes(item)))}
      {...(id !== undefined ? { id } : {})}
    />
  );
}
