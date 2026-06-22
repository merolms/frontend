import type { ReactNode } from "react";

interface ToolbarGroupProps {
  children: ReactNode;
  /** When true, render a subtle divider after the group. */
  hasDivider?: boolean;
  className?: string;
}

/**
 * A consistent container for toolbar button groups.
 * Replaces the old pattern of wrapping groups in `<Alert>`.
 */
export function ToolbarGroup({ children, hasDivider = false, className }: ToolbarGroupProps) {
  return (
    <div className={`relative flex items-center gap-1 ${className ?? ""}`}>
      {children}
      {hasDivider && (
        <div
          aria-hidden
          className="bg-border ml-1 h-5 w-px shrink-0 opacity-50"
        />
      )}
    </div>
  );
}

export default ToolbarGroup;
