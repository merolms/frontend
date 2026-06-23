import { useCallback, useState } from "react";

/**
 * usePagination — hook for table/grid pagination state management.
 *
 * @param {Object} options - Configuration
 * @param {number} options.initialPage - Starting page (default: 1)
 * @param {number} options.initialLimit - Items per page (default: 10)
 * @param {number} options.total - Total number of items
 *
 * @returns {Object} Pagination state and helpers
 *
 * @example
 * const { page, limit, totalPages, setPage, setLimit, offset, goNext, goPrev } = usePagination({
 *   total: 100,
 *   initialLimit: 10,
 * });
 */
export const usePagination = (options = {}) => {
  const { initialPage = 1, initialLimit = 10, total = 0 } = options;
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);

  const totalPages = Math.ceil(total / limit) || 1;
  const offset = (page - 1) * limit;

  const goNext = useCallback(() => {
    setPage((p) => Math.min(p + 1, totalPages));
  }, [totalPages]);

  const goPrev = useCallback(() => {
    setPage((p) => Math.max(p - 1, 1));
  }, []);

  const goTo = useCallback(
    (p) => {
      setPage(Math.max(1, Math.min(p, totalPages)));
    },
    [totalPages]
  );

  const reset = useCallback(() => {
    setPage(initialPage);
    setLimit(initialLimit);
  }, [initialPage, initialLimit]);

  return {
    page,
    limit,
    totalPages,
    offset,
    setPage: goTo,
    setLimit,
    goNext,
    goPrev,
    goTo,
    reset,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
};

export default usePagination;
