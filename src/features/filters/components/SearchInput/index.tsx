import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/button';
import { Input } from '@/components/input';
import { normalizeSearch } from '@/features/filters/searchParams';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import styles from './SearchInput.module.css';

const DEBOUNCE_MS = 400;

type SearchInputProps = {
  /** Committed value, owned by the URL. */
  value: string;
  onCommit: (search: string) => void;
};

export function SearchInput({ value, onCommit }: SearchInputProps) {
  // Only the not-yet-committed keystrokes live here; the URL owns the rest.
  const [draft, setDraft] = useState(value);
  const [seenValue, setSeenValue] = useState(value);
  const sentValue = useRef(value);
  const debounced = useDebouncedValue(draft, DEBOUNCE_MS);

  // The committed value can also change without this input (clear-all-filters,
  // history navigation). Comparing it against the value this input last sent
  // tells the two apart, and adjusting state during render avoids an extra
  // effect pass. The URL update is asynchronous, so its echo must not be
  // mistaken for an external change and overwrite fresher keystrokes.
  if (value !== seenValue) {
    setSeenValue(value);
    if (value !== sentValue.current) setDraft(value);
  }

  useEffect(() => {
    // Wait for the debounce to settle, otherwise a pending keystroke would
    // immediately undo an explicit clear.
    if (debounced !== draft) return;

    const next = normalizeSearch(debounced);
    if (next === value) return;

    sentValue.current = next;
    onCommit(next);
  }, [debounced, draft, value, onCommit]);

  const commitNow = (next: string) => {
    setDraft(next);
    sentValue.current = next;
    onCommit(next);
  };

  return (
    <Input
      type="search"
      value={draft}
      onChange={(event) => setDraft(event.target.value)}
      onKeyDown={(event) => {
        if (event.key === 'Enter') commitNow(normalizeSearch(draft));
        if (event.key === 'Escape' && draft !== '') commitNow('');
      }}
      aria-label="Search articles by keyword"
      placeholder="Search articles..."
      className={styles.input}
      startAdornment={<SearchIcon fontSize="small" color="action" />}
      {...(draft !== ''
        ? {
            endAdornment: (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => commitNow('')}
                aria-label="Clear search"
                className={styles.clear}
              >
                <CloseIcon fontSize="small" />
              </Button>
            ),
          }
        : {})}
    />
  );
}
