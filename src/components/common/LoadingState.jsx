import { Loader } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * LoadingState — reusable loading indicator.
 *
 * Props:
 *   count       - number of skeleton items (default: 3)
 *   height      - height of each skeleton (default: "h-24")
 *   compact     - boolean for smaller skeletons
 *   variant     - "skeleton" | "spinner" (default: "skeleton")
 *   text        - optional text label when variant="spinner"
 *   centered    - center the spinner in a flex container
 *   className   - additional classes
 */
const LoadingState = ({
  count = 3,
  height = "h-24",
  compact = false,
  variant = "skeleton",
  text,
  centered = false,
  className,
}) => {
  if (variant === "spinner") {
    return (
      <div
        className={cn("flex items-center gap-2", centered && "flex-col justify-center", className)}
      >
        <Loader className="text-text-muted animate-spin" size={20} />
        {text && <span className="text-text-muted text-sm">{text}</span>}
      </div>
    );
  }

  return (
    <div className={cn(compact ? "space-y-2" : "space-y-4", className)}>
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          className={`bg-bg-surface border-border rounded-md border ${height} relative overflow-hidden`}
        >
          <div className="via-bg-surface-hover absolute inset-0 animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent to-transparent opacity-50" />
        </div>
      ))}
    </div>
  );
};

export default LoadingState;
