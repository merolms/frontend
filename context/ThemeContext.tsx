// @ts-nocheck
import { createContext, useCallback, useContext, useEffect, useState } from "react";

const THEME_KEY = "meroedu_theme";

const ThemeContext = createContext();

const getSystemTheme = () => {
  if (typeof window === "undefined") return "system";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

const getStoredTheme = () => {
  try {
    return localStorage.getItem(THEME_KEY) || "system";
  } catch {
    return "system";
  }
};

export const ThemeProvider = ({ children }) => {
  const [mode, setMode] = useState(getStoredTheme);
  const [resolvedTheme, setResolvedTheme] = useState(mode === "system" ? getSystemTheme() : mode);

  const changeMode = useCallback((newMode) => {
    setMode(newMode);
    try {
      localStorage.setItem(THEME_KEY, newMode);
    } catch {
      /* ignore */
    }
  }, []);

  // Apply theme to DOM
  useEffect(() => {
    const resolved = mode === "system" ? getSystemTheme() : mode;
    setResolvedTheme(resolved);
    document.documentElement.setAttribute("data-theme", resolved);
    document.documentElement.style.colorScheme = resolved;
  }, [mode]);

  // Listen for system theme changes
  useEffect(() => {
    if (mode !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      const resolved = getSystemTheme();
      setResolvedTheme(resolved);
      document.documentElement.setAttribute("data-theme", resolved);
      document.documentElement.style.colorScheme = resolved;
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [mode]);

  return (
    <ThemeContext.Provider value={{ mode, resolvedTheme, changeMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
};

export default ThemeContext;
