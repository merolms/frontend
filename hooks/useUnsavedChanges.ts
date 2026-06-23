// @ts-nocheck
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Tracks dirty state for a form and warns before leaving with unsaved changes.
 * Returns [dirty, setDirty, updateForm, isDirtyField].
 *
 * @param {object} form - The current form state
 * @param {object} initialForm - The initial/pristine form state to compare against
 * @param {function} setForm - The form setter from useState
 * @param {object} options
 * @param {string} options.draftKey - localStorage key for auto-save draft (optional)
 * @param {function} options.onDirtyChange - callback when dirty state changes
 */
export const useUnsavedChanges = (form, initialForm, setForm, options = {}) => {
  const { draftKey } = options;
  const [dirty, setDirty] = useState(false);
  const initialRef = useRef(initialForm);
  const formRef = useRef(form);
  formRef.current = form;

  // Reset dirty when initial data changes (e.g. after successful save)
  useEffect(() => {
    initialRef.current = initialForm;
  }, [initialForm]);

  // Auto-save draft to localStorage
  useEffect(() => {
    if (dirty && draftKey) {
      const timer = setTimeout(() => {
        localStorage.setItem(draftKey, JSON.stringify(formRef.current));
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [form, dirty, draftKey]);

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (dirty && (formRef.current.title || formRef.current.description)) {
        e.preventDefault();
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [dirty]);

  // Mark dirty on first change
  const updateForm = useCallback(
    (updater) => {
      setForm(updater);
      setDirty(true);
    },
    [setForm]
  );

  // Check if a specific field has been modified
  const isDirtyField = useCallback(
    (field) => {
      return form[field] !== initialRef.current[field];
    },
    [form]
  );

  // Clear dirty state (e.g. after successful save)
  const clearDirty = useCallback(() => {
    setDirty(false);
    if (draftKey) {
      localStorage.removeItem(draftKey);
    }
  }, [draftKey]);

  return { dirty, setDirty, updateForm, isDirtyField, clearDirty };
};
