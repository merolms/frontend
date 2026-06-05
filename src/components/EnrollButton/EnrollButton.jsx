import React, { useState } from "react";
import { CheckCircle, Loader2, Play } from "lucide-react";

/**
 * EnrollButton — shows enrollment state and handles enroll/continue/completed actions.
 *
 * Props:
 *   enrollment  - enrollment object or null (from isEnrolled / getEnrollment)
 *   onEnroll    - async callback to enroll
 *   onContinue  - callback to navigate to course
 *   onReview    - callback to review completed course
 */
const EnrollButton = ({ enrollment, onEnroll, onContinue, onReview }) => {
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
  let variant = "primary";
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
    primary: "bg-primary hover:bg-primary-hover text-white",
    success: "bg-success/10 text-success border border-success/20 cursor-default",
    outline: "border border-border text-text-primary hover:bg-bg-surface-hover",
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading || enrollment?.status === "completed"}
      className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variantStyles[variant]}`}
    >
      {icon}
      {label}
    </button>
  );
};

export default EnrollButton;
