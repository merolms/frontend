import { Moon, Sun } from "lucide-react";

import { useTheme } from "@/context/ThemeContext";

export default function ThemeSwitcher() {
  const { mode, resolvedTheme, changeMode } = useTheme();

  const isDark = resolvedTheme === "dark";

  const toggleTheme = () => {
    const newMode = isDark ? "light" : "dark";
    changeMode(newMode);
  };

  return (
    <button
      onClick={toggleTheme}
      className="bg-bg-surface border-border hover:bg-bg-surface-hover flex h-8 w-8 items-center justify-center rounded-lg border p-1.5 shadow-sm transition-all"
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
