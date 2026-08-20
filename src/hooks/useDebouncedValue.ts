import { useEffect, useState } from 'react';

/**
 * Trails `value` by `delayMs`. The timer is recreated on every change and
 * cleared on unmount, so a fast typist never leaves a pending update behind.
 */
export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    if (Object.is(debounced, value)) return;

    const timeout = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(timeout);
  }, [value, delayMs, debounced]);

  return debounced;
}
