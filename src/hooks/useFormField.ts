import { useCallback, useEffect, useState } from "react";

/**
 * useFormField — Hook for managing form field state with validation.
 *
 * @param {Object} initialValues - Initial form values
 * @param {Object} options - Configuration options
 * @param {Function} options.onChange - External change handler
 * @param {Object} options.validationRules - Field validation rules
 *
 * @returns {Object} Form state and handlers
 *   - values: Current form values
 *   - errors: Validation errors
 *   - handleChange: Change handler for any field
 *   - setFieldValue: Setter for specific field
 *   - validate: Run validation on all fields
 *   - setErrors: Set errors directly
 *   - resetForm: Reset to initial values
 */
const useFormField = (initialValues = {}, options = {}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});

  const { validationRules = {}, onChange } = options;

  // Merge initial values when they change (for edit forms)
  useEffect(() => {
    setValues((prev) => ({ ...prev, ...initialValues }));
  }, [initialValues]);

  const setFieldValue = useCallback(
    (field, value) => {
      setValues((prev) => ({ ...prev, [field]: value }));
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: null }));
      }
    },
    [errors]
  );

  const handleChange = useCallback(
    (field, value) => {
      setFieldValue(field, value);
      if (onChange) {
        onChange(field, value);
      }
    },
    [setFieldValue, onChange]
  );

  const validateField = useCallback(
    (field, value) => {
      if (validationRules[field]) {
        const rule = validationRules[field];
        if (rule.required && !String(value || "").trim()) {
          return rule.message || `${field} is required`;
        }
        if (rule.pattern && value && !rule.pattern.test(value)) {
          return rule.message || `Invalid ${field}`;
        }
        if (rule.minLength && String(value || "").length < rule.minLength) {
          return rule.message || `${field} must be at least ${rule.minLength} characters`;
        }
      }
      return null;
    },
    [validationRules]
  );

  const validate = useCallback(() => {
    const newErrors = {};
    Object.keys(values).forEach((field) => {
      const error = validateField(field, values[field]);
      if (error) {
        newErrors[field] = error;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [values, validateField]);

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
  }, [initialValues]);

  return {
    values,
    errors,
    handleChange,
    setFieldValue,
    validate,
    setErrors,
    resetForm,
  };
};

export default useFormField;
