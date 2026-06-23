import { CheckCircle, Loader2, Play } from "lucide-react";
import { useState } from "react";

interface Enrollment {
  status: string;
  progress: number;
}

interface EnrollButtonProps {
  enrollment: Enrollment | null;
  onEnroll?: () => Promise<void>;
  onContinue?: () => void;
  onReview?: () => void;
}

/**
 * EnrollButton — shows enrollment state and handles enroll/continue/completed actions.
 */
const EnrollButton = ({ enrollment, onEnroll, onContinue, onReview }: EnrollButtonProps) => {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (!enrollment) {
      // Not enrolled — enroll
      setLoading(true);
      try {
        await onEnroll?.();
      } finally {
        setLoading(false);
      }
    } else if (enrollment.status === "completed") {
      onReview?.();
    } else {
      onContinue?.();
    }
  };

  // Determine button state
  let label = "Enroll";
  let variant: "primary" | "success" | "outline" = "primary";
  let icon = null;

  if (loading) {
    label = "Enrolling…";
    icon = <Loader2 size={14} className="animate-spin" />;
  } else if (!enrollment) {
    label = "Enroll";
    icon = null;
  } else if (enrollment.status === "completed") {
    label = "Completed";
    variant = "success";
    icon = <CheckCircle size={14} />;
  } else if (enrollment.progress > 0) {
    label = "Continue";
    variant = "primary";
    icon = <Play size={14} />;
  } else {
    label = "Start Course";
    variant = "primary";
    icon = <Play size={14} />;
  }

  const variantStyles = {
    primary: "bg-primary hover:bg-primary-hover text-secondary",
    success: "bg-success/10 text-success border border-success/20 cursor-default",
    outline: "border border-border text-text-primary hover:bg-bg-surface-hover",
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading || enrollment?.status === "completed"}
      className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${variantStyles[variant]}`}
    >
      {icon}
      {label}
    </button>
  );
};

export default EnrollButton;
