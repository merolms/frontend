// @ts-nocheck
import React from "react";

import { cn } from "@/lib/utils";

const Textarea = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "border-border bg-bg-surface text-text-primary placeholder:text-text-muted focus-visible:ring-primary flex min-h-[80px] w-full rounded-md border px-3 py-2 text-xs shadow-sm transition-colors focus-visible:border-transparent focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
