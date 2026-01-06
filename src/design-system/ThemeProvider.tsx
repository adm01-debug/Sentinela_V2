import * as React from 'react';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import tokens from './tokens';

export type Theme = 'light' | 'dark' | 'system';
export type AccentColor = 'indigo' | 'blue' | 'purple' | 'pink' | 'red' | 'orange' | 'green' | 'teal';

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  accentColor: AccentColor;
  setTheme: (theme: Theme) => void;
  setAccentColor: (color: AccentColor) => void;
  tokens: typeof tokens;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const ACCENT_COLORS: Record<AccentColor, string> = {
  indigo: '239 84% 67%', blue: '217 91% 60%', purple: '271 91% 65%', pink: '330 81% 60%',
  red: '0 84% 60%', orange: '25 95% 53%', green: '142 71% 45%', teal: '173 80% 40%'
};

export function ThemeProvider({ children, defaultTheme = 'system', defaultAccent = 'indigo' }: { children: React.ReactNode; defaultTheme?: Theme; defaultAccent?: AccentColor }) {
  const [theme, setThemeState] = useState<Theme>(() => (localStorage.getItem('theme') as Theme) || defaultTheme);
  const [accentColor, setAccentState] = useState<AccentColor>(() => (localStorage.getItem('accent') as AccentColor) || defaultAccent);
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      const resolved = theme === 'system' ? (mediaQuery.matches ? 'dark' : 'light') : theme;
      setResolvedTheme(resolved);
      document.documentElement.classList.toggle('dark', resolved === 'dark');
    };
    handleChange();
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  useEffect(() => {
    document.documentElement.style.setProperty('--primary', ACCENT_COLORS[accentColor]);
  }, [accentColor]);

  const setTheme = useCallback((t: Theme) => { setThemeState(t); localStorage.setItem('theme', t); }, []);
  const setAccentColor = useCallback((c: AccentColor) => { setAccentState(c); localStorage.setItem('accent', c); }, []);

  return <ThemeContext.Provider value={{ theme, resolvedTheme, accentColor, setTheme, setAccentColor, tokens }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
}

export default ThemeProvider;
