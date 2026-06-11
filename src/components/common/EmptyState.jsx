import { cn } from "@/lib/utils";

/**
 * EmptyState — reusable empty state with icon, message, and optional action.
 *
 * Props:
 *   icon        - React node (default: 📭)
 *   title       - Main message (required)
 *   description - Secondary message
 *   action      - React node (button/link)
 *   compact     - boolean for smaller padding
 *   variant     - "default" | "search" | "filter" | "error"
 */
const EmptyState = ({ icon = "📭", title, description, action, compact = false, variant = "default" }) => {
  const variantStyles = {
    default: "",
    search: "bg-bg-surface-active/30",
    filter: "bg-bg-surface-active/30",
    error: "bg-error/5",
  };

  const getVariantIcon = () => {
    switch (variant) {
      case "search":
        return "🔍";
      case "filter":
        return "🎯";
      case "error":
        return "⚠️";
      default:
        return icon;
    }
  };

  const getVariantTitle = () => {
    switch (variant) {
      case "search":
        return title || "No results found";
      case "filter":
        return title || "No matches found";
      case "error":
        return title || "Something went wrong";
      default:
        return title;
    }
  };

  const getVariantDescription = () => {
    switch (variant) {
      case "search":
        return description || "Try adjusting your search terms or filters";
      case "filter":
        return description || "Try clearing or adjusting your filters";
      case "error":
        return description || "Please try again or contact support if the problem persists";
      default:
        return description;
    }
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex flex-col items-center justify-center text-center rounded-md",
        variantStyles[variant],
        compact ? "p-6" : "p-12"
      )}
    >
      <div
        className={cn(
          "opacity-50",
          compact ? "mb-2 text-3xl" : "mb-4 text-5xl"
        )}
      >
        {getVariantIcon()}
      </div>
      <p
        className={cn(
          "text-text-primary font-medium m-0",
          compact ? "text-xs" : "text-sm"
        )}
      >
        {getVariantTitle()}
      </p>
      {getVariantDescription() && (
        <p className="text-text-muted mt-1 mb-0 text-xs">
          {getVariantDescription()}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
};

export default EmptyState;
