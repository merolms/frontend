import React from "react";
import { useTheme } from "@/app/context/ThemeContext";
import { Sun, Moon, Monitor } from "lucide-react";

export default function ThemeSwitcher() {
  const { mode, changeMode } = useTheme();

  // Fallback for when mode is not correctly initialized
  const currentMode = (mode === "light" || mode === "dark" || mode === "system") ? mode : "system";

  return (
    <div 
      className="flex items-center gap-2 p-1 bg-bg-surface border border-border rounded-md shadow-sm"
      style={{ 
        minWidth: '120px',
        justifyContent: 'space-between' 
      }}
    >
      <span className="text-[10px] font-bold uppercase text-text-muted" style={{ flexShrink: 0 }}>
        {currentMode}
      </span>
      <div className="flex gap-1">
        <button 
          onClick={() => changeMode("light")} 
          className="p-1.5 hover:bg-bg-surface-hover rounded transition-colors"
          style={{ border: '1px solid transparent' }}
          title="Light Mode"
        >
          <Sun className="h-4 w-4" />
        </button>
        <button 
          onClick={() => changeMode("dark")} 
          className="p-1.5 hover:bg-bg-surface-hover rounded transition-colors"
          style={{ border: '1px solid transparent' }}
          title="Dark Mode"
        >
          <Moon className="h-4 w-4" />
        </button>
        <button 
          onClick={() => changeMode("system")} 
          className="p-1.5 hover:bg-bg-surface-hover rounded transition-colors"
          style={{ border: '1px solid transparent' }}
          title="System Mode"
        >
          <Monitor className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
