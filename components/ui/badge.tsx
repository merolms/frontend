// @ts-nocheck
import { X } from "lucide-react";
import React from "react";

import { cn } from "@/lib/utils";

const Badge = React.forwardRef(
  ({ className, variant = "default", children, onClose, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          "focus:ring-ring inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none",
          {
            "bg-primary text-primary-foreground border-transparent": variant === "default",
            "bg-secondary text-secondary-foreground border-transparent": variant === "secondary",
            "bg-destructive text-destructive-foreground border-transparent":
              variant === "destructive",
            "bg-success text-success-foreground border-transparent": variant === "green",
            "bg-warning text-warning-foreground border-transparent": variant === "orange",
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
