import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark' | 'system';

interface ThemeState {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
}

interface ThemeActions {
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

type ThemeStore = ThemeState & ThemeActions;

const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const resolveTheme = (theme: Theme): 'light' | 'dark' => {
  return theme === 'system' ? getSystemTheme() : theme;
};

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      theme: 'system',
      resolvedTheme: getSystemTheme(),

      setTheme: (theme) =>
        set({
          theme,
          resolvedTheme: resolveTheme(theme),
        }),

      toggleTheme: () =>
        set((state) => {
          const newTheme = state.resolvedTheme === 'light' ? 'dark' : 'light';
          return {
            theme: newTheme,
            resolvedTheme: newTheme,
          };
        }),
    }),
    {
      name: 'sentinela-theme',
      partialize: (state) => ({ theme: state.theme }),
    }
  )
);

export type { Theme, ThemeState };
