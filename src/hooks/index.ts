// UI utility hooks — kept because they're not data-fetching related
export { useAuthenticatedMediaUrl } from "./useAuthenticatedMediaUrl";
export { default as useConfirmation } from "./useConfirmation";
export { default as useFormField } from "./useFormField";
export { usePageTitle } from "./usePageTitle";
export { default as usePagination } from "./usePagination";
export { useUnsavedChanges } from "./useUnsavedChanges";

// Data-fetching hooks — replaced by TanStack Query
// useApi, useAsyncData, useListData are removed.
// Use the query hooks from @/hooks/queries/ instead.
