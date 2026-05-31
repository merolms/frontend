import { AlignLeft, LayoutGrid, List, Table as TableIcon } from "lucide-react";
import React from "react";

import { cn } from "@/lib/utils";

const viewModes = [
  { value: "grid", label: "Grid", icon: LayoutGrid },
  { value: "table", label: "Table", icon: TableIcon },
  { value: "list", label: "List", icon: List },
  { value: "compact", label: "Compact", icon: AlignLeft },
];

const ViewModeSwitcher = ({ value, onChange }) => (
  <div className="border-border flex items-center overflow-hidden rounded-md border">
    {viewModes.map((m) => {
      const Icon = m.icon;
      return (
        <button
          key={m.value}
          title={m.label}
          onClick={() => onChange(m.value)}
          className={cn(
            "flex h-7 w-7 cursor-pointer items-center justify-center transition-colors",
            value === m.value
              ? "bg-primary text-white"
              : "text-text-muted hover:bg-bg-surface-active"
          )}
        >
          <Icon size={14} />
        </button>
      );
    })}
  </div>
);

export default ViewModeSwitcher;
