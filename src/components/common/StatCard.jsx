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
    success: "bg-green-500/10 text-green-600",
    warning: "bg-orange-500/10 text-orange-600",
    accent: "bg-blue-500/10 text-blue-600",
    error: "bg-red-500/10 text-red-600",
  };

  return (
    <div className="border-border bg-card rounded-xl border p-6 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-center gap-4">
        <div
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-xl",
            colorClasses[color]
          )}
        >
          {Icon && <Icon size={24} />}
        </div>
        <div>
          <p className="text-foreground text-3xl font-bold tracking-tight">{value}</p>
          <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
            {title}
          </p>
        </div>
      </div>
    </div>
  );
});

export default StatCard;
