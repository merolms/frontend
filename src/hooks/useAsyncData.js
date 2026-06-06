import { useCallback, useState } from "react";

/**
 * useAsyncData — hook for single-item async data fetching with loading/error state.
 *
 * Pattern: fetch one item by ID (e.g., course detail, user profile)
 *
 * @param {Function} fetchFn - Async function that fetches the data
 * @param {Object} options - Configuration
 * @param {boolean} options.immediate - Whether to fetch immediately (default: true)
 * @param {Function} options.onSuccess - Callback on successful fetch
 * @param {Function} options.onError - Callback on error
 *
 * @returns {Object} { data, loading, error, fetch, refetch, setData, reset }
 *
 * @example
 * const { data: course, loading, error, refetch } = useAsyncData(
 *   () => fetchCourseById(id),
 *   { immediate: true }
 * );
 */
export const useAsyncData = (fetchFn, options = {}) => {
  const { immediate = true, onSuccess, onError } = options;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);

  const execute = useCallback(
    async (...args) => {
      setLoading(true);
      setError(null);
      try {
        const result = await fetchFn(...args);
        setData(result);
        onSuccess?.(result);
        return result;
      } catch (err) {
        const message = err.message || "Failed to load data";
        setError(message);
        onError?.(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchFn, onSuccess, onError]
  );

  const reset = useCallback(() => {
    setData(null);
    setLoading(false);
    setError(null);
  }, []);

  return { data, loading, error, fetch: execute, refetch: execute, setData, reset };
};

export default useAsyncData;
