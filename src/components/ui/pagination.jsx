import React from 'react';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ total, value, onChange, className }) => {
  if (total <= 1) return null;

  const pages = [];
  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || (i >= value - 1 && i <= value + 1)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...');
    }
  }

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <button
        onClick={() => onChange(Math.max(1, value - 1))}
        disabled={value === 1}
        className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-text-secondary hover:bg-bg-surface-disabled disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
      >
        <ChevronLeft size={14} />
      </button>
      {pages.map((p, i) =>
        p === '...' ? (
          <span key={`dots-${i}`} className="px-1 text-text-muted text-xs">…</span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p)}
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-md text-xs font-medium transition-colors cursor-pointer',
              p === value
                ? 'bg-primary text-white'
                : 'border border-border text-text-secondary hover:bg-bg-surface-active'
            )}
          >
            {p}
          </button>
        )
      )}
      <button
        onClick={() => onChange(Math.min(total, value + 1))}
        disabled={value === total}
        className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-text-secondary hover:bg-bg-surface-active disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
      >
        <ChevronRight size={14} />
      </button>
    </div>
  );
};

export { Pagination };
