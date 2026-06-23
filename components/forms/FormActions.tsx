import { Button } from "@/components/ui/Button";

interface FormActionsProps {
  onCancel?: () => void;
  loading?: boolean;
  submitLabel?: string;
  showCancel?: boolean;
  disabled?: boolean;
}

/**
 * FormActions — Standardized form action buttons (Cancel + Submit).
 */
const FormActions = ({
  onCancel,
  loading,
  submitLabel = "Save",
  showCancel,
  disabled,
}: FormActionsProps) => {
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
