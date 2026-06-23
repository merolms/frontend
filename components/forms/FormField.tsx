import { cn } from "@/lib/utils";

/**
 * FormField — Reusable form field wrapper with label and error handling.
 *
 * Props:
 *   label       - Field label (required)
 *   error       - Error message string
 *   required    - Boolean for required field indicator
 *   children    - Input element(s)
 *   className   - Additional wrapper classes
 */
const FormField = ({ label, error, required, children, className }) => {
  return (
    <div className={cn("space-y-1.5", className)}>
      {label && (
        <label className="text-text-primary text-xs font-medium">
          {label}
          {required && <span className="text-error ml-0.5">*</span>}
        </label>
      )}
      {children}
      {error && <p className="text-error mt-0.5 text-[11px]">{error}</p>}
    </div>
  );
};

export default FormField;
