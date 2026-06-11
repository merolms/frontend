import { cn } from "@/lib/utils";
import { memo } from "react";

/**
 * StatCard — Reusable statistics card component.
 *
 * Props:
 *   title    - Stat label (required)
 *   value    - Stat value (required)
 *   icon     - Icon component to display
 *   color    - Theme color: "primary" | "success" | "warning" | "accent" | "error"
 *   className - Additional classes
 */
const StatCard = memo(({ title, value, icon: Icon, color = "primary", className }) => {
  const colorClasses = {
    primary: "bg-primary/10 text-primary",
    success: "bg-success/10 text-success",
    warning: "bg-warning/10 text-warning",
    accent: "bg-accent/10 text-accent",
    error: "bg-error/10 text-error",
  };

  return (
    <div className="border-border bg-bg-surface rounded-md border p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-md",
            colorClasses[color]
          )}
        >
          {Icon && <Icon size={18} />}
        </div>
        <div>
          <p className="text-text-primary text-2xl font-bold">{value}</p>
          <p className="text-text-muted text-[11px]">{title}</p>
        </div>
      </div>
    </div>
  );
});

export default StatCard;
