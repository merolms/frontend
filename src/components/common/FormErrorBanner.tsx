import { AlertCircle } from "lucide-react";

/**
 * FormErrorBanner — Reusable error banner for forms.
 *
 * Props:
 *   message - Error message to display
 */
const FormErrorBanner = ({ message }) => {
  if (!message) return null;

  return (
    <div className="text-error flex items-center gap-2 text-sm">
      <AlertCircle size={14} />
      <span>{message}</span>
    </div>
  );
};

export default FormErrorBanner;
