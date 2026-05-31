import React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef(({ className, type = "text", ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "border-border bg-bg-surface text-text-primary placeholder:text-text-muted focus-visible:ring-primary flex h-8 w-full rounded-md border px-3 py-1.5 text-xs shadow-sm transition-colors focus-visible:border-transparent focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";

export { Input };
