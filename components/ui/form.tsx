// @ts-nocheck
import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef(({ className, type, ...props }, ref) => (
  <input
    type={type}
    className={cn(
      "border-border bg-bg-surface text-text-primary flex h-9 w-full rounded-lg border px-3 py-2 text-sm shadow-sm transition-colors",
      "placeholder:text-text-muted",
      "focus-visible:ring-primary focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:outline-none",
      "disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    ref={ref}
    {...props}
  />
));
Input.displayName = "Input";

const Textarea = React.forwardRef(({ className, ...props }, ref) => (
  <textarea
    className={cn(
      "border-border bg-bg-surface text-text-primary flex min-h-[80px] w-full rounded-lg border px-3 py-2 text-sm shadow-sm transition-colors",
      "placeholder:text-text-muted",
      "focus-visible:ring-primary focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:outline-none",
      "disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    ref={ref}
    {...props}
  />
));
Textarea.displayName = "Textarea";

const Label = React.forwardRef(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={cn(
      "text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
      className
    )}
    {...props}
  />
));
Label.displayName = "Label";

const Select = React.forwardRef(({ className, children, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(
      "border-border bg-bg-surface text-text-primary flex h-9 w-full rounded-lg border px-3 py-2 text-sm shadow-sm",
      "focus-visible:ring-primary focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:outline-none",
      className
    )}
    {...props}
  >
    {children}
  </select>
));
Select.displayName = "Select";

const Badge = React.forwardRef(({ className, variant = "default", ...props }, ref) => {
  const variants = {
    default: "bg-primary-light text-primary",
    success: "bg-success-light text-text-primary",
    warning: "bg-warning-light text-text-primary",
    error: "bg-error-light text-text-primary",
    outline: "border border-border text-text-secondary",
  };
  return (
    <div
      ref={ref}
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variants[variant],
        className
      )}
      {...props}
    />
  );
});
Badge.displayName = "Badge";

const Separator = React.forwardRef(({ className, orientation = "horizontal", ...props }, ref) => (
  <div
    ref={ref}
    role="separator"
    aria-orientation={orientation}
    className={cn(
      "bg-border shrink-0",
      orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
      className
    )}
    {...props}
  />
));
Separator.displayName = "Separator";

const Progress = React.forwardRef(({ className, value, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("bg-bg-secondary relative h-2 w-full overflow-hidden rounded-full", className)}
    {...props}
  >
    <div className="bg-primary h-full transition-all" style={{ width: `${value || 0}%` }} />
  </div>
));
Progress.displayName = "Progress";

const Avatar = React.forwardRef(({ className, src, alt, fallback, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full", className)}
    {...props}
  >
    {src ? (
      <img src={src} alt={alt} className="aspect-square h-full w-full object-cover" />
    ) : (
      <div className="bg-bg-secondary text-text-muted flex h-full w-full items-center justify-center rounded-full text-sm font-medium">
        {fallback || "?"}
      </div>
    )}
  </div>
));
Avatar.displayName = "Avatar";

export { Avatar, Badge, Input, Label, Progress, Select, Separator, Textarea };
