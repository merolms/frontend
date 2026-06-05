import { useCallback, useState } from "react";

/**
 * useApi — reusable hook for API calls with loading/error state.
 *
 * Returns: { data, loading, error, execute, reset }
 */
export const useApi = (apiFn) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(
    async (...args) => {
      setLoading(true);
      setError(null);
      try {
        const result = await apiFn(...args);
        setData(result);
        return result;
      } catch (err) {
        setError(err.message || "An error occurred");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [apiFn]
  );

  const reset = useCallback(() => {
    setData(null);
    setLoading(false);
    setError(null);
  }, []);

  return { data, loading, error, execute, reset };
};

/**
 * useListData — reusable hook for list pages with search, filter, pagination.
 *
 * Returns: { items, loading, error, total, page, setPage, search, setSearch, refetch }
 */
export const useListData = (fetchFn, initialParams = {}) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [params, setParams] = useState(initialParams);

  const load = useCallback(
    async (overrides = {}) => {
      try {
        setLoading(true);
        setError(null);
        const queryParams = { page, search, ...params, ...overrides };
        const result = await fetchFn(queryParams);
        setItems(result.items || result.courses || result.paths || result || []);
        setTotal(result.total || 0);
      } catch (err) {
        setError(err.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    },
    [fetchFn, page, search, params]
  );

  const refetch = useCallback(() => load(), [load]);

  return {
    items,
    loading,
    error,
    total,
    page,
    setPage,
    search,
    setSearch,
    params,
    setParams,
    load,
    refetch,
  };
};

export default useApi;
