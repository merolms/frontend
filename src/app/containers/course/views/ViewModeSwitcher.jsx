import React from 'react';
import { LayoutGrid, List, Table as TableIcon, AlignLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

const viewModes = [
  { value: 'grid', label: 'Grid', icon: LayoutGrid },
  { value: 'table', label: 'Table', icon: TableIcon },
  { value: 'list', label: 'List', icon: List },
  { value: 'compact', label: 'Compact', icon: AlignLeft },
];

const ViewModeSwitcher = ({ value, onChange }) => (
  <div className="flex items-center rounded-md border border-border overflow-hidden">
    {viewModes.map((m) => {
      const Icon = m.icon;
      return (
        <button
          key={m.value}
          title={m.label}
          onClick={() => onChange(m.value)}
          className={cn(
            'flex h-7 w-7 items-center justify-center transition-colors cursor-pointer',
            value === m.value
              ? 'bg-primary text-white'
              : 'text-text-muted hover:bg-bg-surface-active'
          )}
        >
          <Icon size={14} />
        </button>
      );
    })}
  </div>
);

export default ViewModeSwitcher;
