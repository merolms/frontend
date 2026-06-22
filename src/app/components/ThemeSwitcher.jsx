import { Moon, Sun } from "lucide-react";

import { useTheme } from "@/app/context/ThemeContext";

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
      className="flex h-8 w-8 items-center justify-center rounded-lg bg-bg-surface border-border border p-1.5 shadow-sm transition-all hover:bg-bg-surface-hover"
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      {isDark ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </button>
  );
}
