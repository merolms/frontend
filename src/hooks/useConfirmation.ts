import { useCallback, useState } from "react";

/**
 * useConfirmation — hook for managing confirmation dialog state.
 *
 * Pattern: confirm before destructive actions (delete, drop, archive, etc.)
 *
 * @param {Object} options - Configuration
 * @param {Function} options.onConfirm - Callback when user confirms
 * @param {Function} options.onCancel - Callback when user cancels
 * @param {string} options.title - Dialog title (default: "Are you sure?")
 * @param {string} options.description - Dialog description
 * @param {string} options.confirmText - Confirm button text (default: "Confirm")
 * @param {string} options.cancelText - Cancel button text (default: "Cancel")
 * @param {string} options.variant - "danger" | "default" (default: "danger")
 *
 * @returns {Object} { isOpen, open, close, confirm, onConfirm }
 *
 * @example
 * const { open, close, confirm } = useConfirmation({
 *   title: "Delete Course",
 *   description: "This action cannot be undone.",
 *   onConfirm: async () => await deleteCourse(id),
 * });
 *
 * // In JSX:
 * <button onClick={() => open({ onConfirm: () => deleteItem(item) })}>Delete</button>
 */
export const useConfirmation = (options = {}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [loading, setLoading] = useState(false);

  const open = useCallback((actionOptions = {}) => {
    setPendingAction(actionOptions);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setPendingAction(null);
    setLoading(false);
  }, []);

  const confirm = useCallback(async () => {
    const action = pendingAction || options;
    if (action.onConfirm) {
      setLoading(true);
      try {
        await action.onConfirm();
        close();
      } catch (err) {
        setLoading(false);
        throw err;
      }
    } else {
      close();
    }
  }, [pendingAction, options, close]);

  return {
    isOpen,
    open,
    close,
    confirm,
    loading,
    pendingAction,
  };
};

export default useConfirmation;
