/**
 * Theme token helper for JSX inline styles.
 *
 * Usage:
 *   import { t, useTheme, isDark } from '@/styles/theme';
 *
 *   const [theme, setTheme] = useTheme();
 *   <div style={{ color: t('text-primary'), background: t('bg-surface') }} />
 *
 *   // With opacity modifier:
 *   <div style={{ background: t('primary', 0.1) }} />
 */

import React from 'react';

// Light theme tokens (default)
const light = {
  'primary': '#6366F1',
  'primary-hover': '#4F46E5',
  'primary-active': '#4338CA',
  'primary-light': 'rgba(99,102,241,0.1)',
  'secondary': '#8B5CF6',
  'accent': '#06B6D4',
  'success': '#10B981',
  'warning': '#F59E0B',
  'error': '#EF4444',
  'error-light': 'rgba(239,68,68,0.1)',
  'focus-ring': '#818CF8',

  'bg-primary': '#F8FAFC',
  'bg-secondary': '#F1F5F9',
  'bg-surface': '#FFFFFF',
  'bg-surface-hover': '#F8FAFC',
  'bg-sidebar': '#FFFFFF',
  'bg-sidebar-hover': '#F1F5F9',
  'bg-overlay': 'rgba(15,23,42,0.4)',
  'bg-input': '#FFFFFF',
  'bg-hover': '#F1F5F9',
  'bg-active': '#E2E8F0',

  'text-primary': '#0F172A',
  'text-secondary': '#475569',
  'text-muted': '#94A3B8',
  'text-disabled': '#CBD5E1',
  'text-inverse': '#FFFFFF',
  'text-sidebar': '#475569',
  'text-sidebar-muted': '#94A3B8',

  'border-primary': '#E2E8F0',
  'border-secondary': '#CBD5E1',
  'border-hover': '#94A3B8',
  'border-input': '#E2E8F0',
  'border-sidebar': '#E2E8F0',
};

// Dark theme tokens
const dark = {
  'primary': '#818CF8',
  'primary-hover': '#6366F1',
  'primary-active': '#4F46E5',
  'primary-light': 'rgba(129,140,248,0.12)',
  'secondary': '#A78BFA',
  'accent': '#22D3EE',
  'success': '#34D399',
  'warning': '#FBBF24',
  'error': '#F87171',
  'error-light': 'rgba(248,113,113,0.12)',
  'focus-ring': '#818CF8',

  'bg-primary': '#0A0A0A',
  'bg-secondary': '#111111',
  'bg-surface': '#171717',
  'bg-surface-hover': '#202020',
  'bg-sidebar': '#0F0F0F',
  'bg-sidebar-hover': '#1A1A1A',
  'bg-overlay': 'rgba(0,0,0,0.6)',
  'bg-input': '#111111',
  'bg-hover': '#27272A',
  'bg-active': '#3F3F46',

  'text-primary': '#FAFAFA',
  'text-secondary': '#A1A1AA',
  'text-muted': '#71717A',
  'text-disabled': '#52525B',
  'text-inverse': '#0A0A0A',
  'text-sidebar': '#A1A1AA',
  'text-sidebar-muted': '#71717A',

  'border-primary': '#27272A',
  'border-secondary': '#3F3F46',
  'border-hover': '#52525B',
  'border-input': '#27272A',
  'border-sidebar': '#27272A',
};

// Current theme — sync with data-theme on <html> if already set
let currentTheme = 'light';
if (typeof document !== 'undefined') {
  const existing = document.documentElement.getAttribute('data-theme');
  if (existing === 'dark') currentTheme = 'dark';
}

const listeners = new Set();

/** Set active theme ('light' | 'dark') */
export function setTheme(theme) {
  currentTheme = theme;
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', theme);
  }
  listeners.forEach((fn) => fn(theme));
}

/** Get active theme */
export function getTheme() {
  return currentTheme;
}

/** Subscribe to theme changes. Returns unsubscribe function. */
export function onThemeChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/**
 * Get a theme token value.
 * @param {string} token - Token name (e.g. 'primary', 'bg-surface')
 * @param {number} [opacity] - Optional opacity override (0-1)
 * @returns {string} Color value
 */
export function t(token, opacity) {
  const tokens = currentTheme === 'dark' ? dark : light;
  const value = tokens[token] || token;
  if (opacity == null) return value;
  // Convert hex to rgba with opacity
  if (value.startsWith('#')) {
    const r = parseInt(value.slice(1, 3), 16);
    const g = parseInt(value.slice(3, 5), 16);
    const b = parseInt(value.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${opacity})`;
  }
  return value;
}

/** Check if an element or <html> has dark theme */
export function isDark() {
  if (typeof document !== 'undefined') {
    return document.documentElement.getAttribute('data-theme') === 'dark';
  }
  return currentTheme === 'dark';
}

export const colors = { light, dark };

/** React hook: returns [theme, setTheme] and auto-renders on change */
export function useTheme() {
  const [theme, setThemeState] = React.useState(currentTheme);
  React.useEffect(() => {
    // Listen for programmatic theme changes via our setTheme()
    const unsub = onThemeChange(setThemeState);

    // Also listen for external data-theme attribute changes (e.g. from other toggle)
    let observer;
    if (typeof MutationObserver !== 'undefined') {
      observer = new MutationObserver((mutations) => {
        for (const m of mutations) {
          if (m.type === 'attributes' && m.attributeName === 'data-theme') {
            const val = document.documentElement.getAttribute('data-theme');
            if (val && val !== currentTheme) {
              currentTheme = val;
              setThemeState(val);
            }
          }
        }
      });
      observer.observe(document.documentElement, { attributes: true });
    }

    return () => { unsub(); observer?.disconnect(); };
  }, []);
  return [theme, setTheme];
}
