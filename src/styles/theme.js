/**
 * Theme token helper for JSX inline styles.
 * Reads from CSS custom properties set by Tailwind theme.
 */

let currentTheme = 'light';
if (typeof document !== 'undefined') {
  const existing = document.documentElement.getAttribute('data-theme');
  if (existing === 'dark') currentTheme = 'dark';
}

const listeners = new Set();

export function setTheme(theme) {
  currentTheme = theme;
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.style.colorScheme = theme;
  }
  listeners.forEach((fn) => fn(theme));
}

export function getTheme() { return currentTheme; }

export function onThemeChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** Get CSS custom property value for a design token */
export function t(token, opacity) {
  if (typeof document === 'undefined') return '';
  const val = getComputedStyle(document.documentElement).getPropertyValue(`--${token}`).trim();
  if (!opacity || opacity === 1) return val;
  if (val.startsWith('#')) {
    const r = parseInt(val.slice(1, 3), 16);
    const g = parseInt(val.slice(3, 5), 16);
    const b = parseInt(val.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${opacity})`;
  }
  if (val.startsWith('rgba')) return val.replace(/[\d.]+\)$/, `${opacity})`);
  return val;
}

export function isDark() { return currentTheme === 'dark'; }

/** React hook: [theme, setTheme] */
export function useTheme() {
  const [theme, setThemeState] = React.useState(currentTheme);
  React.useEffect(() => {
    const unsub = onThemeChange(setThemeState);
    let observer;
    if (typeof MutationObserver !== 'undefined') {
      observer = new MutationObserver((mutations) => {
        for (const m of mutations) {
          if (m.type === 'attributes' && m.attributeName === 'data-theme') {
            const val = document.documentElement.getAttribute('data-theme');
            if (val && val !== currentTheme) { currentTheme = val; setThemeState(val); }
          }
        }
      });
      observer.observe(document.documentElement, { attributes: true });
    }
    return () => { unsub(); observer?.disconnect(); };
  }, []);
  return [theme, setTheme];
}
