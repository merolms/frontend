import React from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

const Badge = React.forwardRef(
  ({ className, variant = "default", children, onClose, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold",
          {
            "bg-primary-light text-primary": variant === "default",
            "bg-success/12 text-success": variant === "green",
            "bg-accent/12 text-accent": variant === "blue",
            "bg-warning/12 text-warning": variant === "orange",
            "bg-error/12 text-error": variant === "red",
            "bg-bg-surface-active text-text-muted": variant === "gray",
          },
          className
        )}
        {...props}
      >
        {children}
        {onClose && (
          <button onClick={onClose} className="ml-0.5 cursor-pointer hover:opacity-70">
            <X size={10} />
          </button>
        )}
      </span>
    );
  }
);
Badge.displayName = "Badge";

export { Badge };
