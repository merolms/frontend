import { Monitor, Moon, Sun } from "lucide-react";

import { useTheme } from "@/app/context/ThemeContext";

export default function ThemeSwitcher() {
  const { changeMode } = useTheme();

  return (
    <div
      className="bg-bg-surface border-border flex items-center gap-2 rounded-md border p-1 shadow-sm"
      style={{
        minWidth: "120px",
        justifyContent: "space-between",
      }}
    >
      <div className="flex gap-1">
        <button
          onClick={() => changeMode("light")}
          className="hover:bg-bg-surface-hover rounded p-1.5 transition-colors"
          style={{ border: "1px solid transparent" }}
          title="Light Mode"
        >
          <Sun className="h-4 w-4" />
        </button>
        <button
          onClick={() => changeMode("dark")}
          className="hover:bg-bg-surface-hover rounded p-1.5 transition-colors"
          style={{ border: "1px solid transparent" }}
          title="Dark Mode"
        >
          <Moon className="h-4 w-4" />
        </button>
        <button
          onClick={() => changeMode("system")}
          className="hover:bg-bg-surface-hover rounded p-1.5 transition-colors"
          style={{ border: "1px solid transparent" }}
          title="System Mode"
        >
          <Monitor className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
