import { useEffect, useState } from "react";

/**
 * Debounce a value — returns `value` after `delay` ms have elapsed without it
 * changing. Extracted out of `Editor` so a fresh hook instance isn't created
 * on every render (which would defeat the debounce).
 *
 * @example
 *   const debounced = useDebounce(content, 1000);
 *   useEffect(() => save(debounced), [debounced]);
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

export default useDebounce;
