import { Button } from "@/components/ui/button";

/**
 * FormActions — Standardized form action buttons (Cancel + Submit).
 *
 * Props:
 *   onCancel   - Cancel callback
 *   loading    - Loading state for submit button
 *   submitLabel - Submit button label (default: "Save")
 *   showCancel - Whether to show cancel button (default: true when onCancel provided)
 *   disabled   - Disabled state for submit button
 */
const FormActions = ({ onCancel, loading, submitLabel = "Save", showCancel, disabled }) => {
  const showCancelBtn = showCancel !== undefined ? showCancel : !!onCancel;

  return (
    <div className="flex justify-end gap-2 pt-2">
      {showCancelBtn && (
        <Button type="button" variant="default" onClick={onCancel} disabled={loading || disabled}>
          Cancel
        </Button>
      )}
      <Button type="submit" disabled={loading || disabled}>
        {submitLabel}
      </Button>
    </div>
  );
};

export default FormActions;
