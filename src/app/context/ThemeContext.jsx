import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { setTheme as setThemeToken } from '@/styles/theme';

const THEME_KEY = 'meroedu_theme';

const ThemeContext = createContext();

const getSystemTheme = () =>
  window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

const getStoredTheme = () => {
  try {
    return localStorage.getItem(THEME_KEY) || 'system';
  } catch {
    return 'system';
  }
};

export const ThemeProvider = ({ children }) => {
  const [mode, setMode] = useState(getStoredTheme); // 'dark' | 'light' | 'system'
  const [resolvedTheme, setResolvedTheme] = useState(
    mode === 'system' ? getSystemTheme() : mode
  );

  // Persist mode change
  const changeMode = useCallback((newMode) => {
    setMode(newMode);
    try {
      localStorage.setItem(THEME_KEY, newMode);
    } catch {
      // ignore
    }
  }, []);

  // Resolve actual theme and apply to DOM
  useEffect(() => {
    const resolved = mode === 'system' ? getSystemTheme() : mode;
    setResolvedTheme(resolved);
    document.documentElement.setAttribute('data-theme', resolved);
    setThemeToken(resolved);
  }, [mode]);

  // Listen for system theme changes
  useEffect(() => {
    if (mode !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      const resolved = getSystemTheme();
      setResolvedTheme(resolved);
      document.documentElement.setAttribute('data-theme', resolved);
      setThemeToken(resolved);
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [mode]);

  return (
    <ThemeContext.Provider value={{ mode, resolvedTheme, changeMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};

export default ThemeContext;
