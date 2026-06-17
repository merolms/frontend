import { X } from "lucide-react";
import React from "react";

import { cn } from "@/lib/utils";

const Badge = React.forwardRef(
  ({ className, variant = "default", children, onClose, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          {
            "border-transparent bg-primary text-primary-foreground": variant === "default",
            "border-transparent bg-secondary text-secondary-foreground": variant === "secondary",
            "border-transparent bg-destructive text-destructive-foreground": variant === "destructive",
            "border-transparent bg-success text-success-foreground": variant === "green",
            "border-transparent bg-warning text-warning-foreground": variant === "orange",
            "border-border text-foreground": variant === "outline",
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
