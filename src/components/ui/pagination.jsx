import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

const Pagination = ({ total, value, onChange, className }) => {
  if (total <= 1) return null;

  const pages = [];
  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || (i >= value - 1 && i <= value + 1)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "...") {
      pages.push("...");
    }
  }

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <button
        onClick={() => onChange(Math.max(1, value - 1))}
        disabled={value === 1}
        className="border-border text-text-secondary hover:bg-bg-surface-active flex h-8 cursor-pointer items-center gap-1 rounded-md border px-2 text-xs disabled:pointer-events-none disabled:opacity-50"
      >
        <ChevronLeft size={14} />
        <span>Previous</span>
      </button>
      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`dots-${i}`} className="text-text-muted px-1 text-xs">
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p)}
            className={cn(
              "flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-xs font-medium transition-colors",
              p === value
                ? "bg-primary text-secondary"
                : "border-border text-text-secondary hover:bg-bg-surface-active border"
            )}
          >
            {p}
          </button>
        )
      )}
      <button
        onClick={() => onChange(Math.min(total, value + 1))}
        disabled={value === total}
        className="border-border text-text-secondary hover:bg-bg-surface-active flex h-8 cursor-pointer items-center gap-1 rounded-md border px-2 text-xs disabled:pointer-events-none disabled:opacity-50"
      >
        <span>Next</span>
        <ChevronRight size={14} />
      </button>
    </div>
  );
};

export { Pagination };
