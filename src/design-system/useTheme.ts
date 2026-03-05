// Theme hooks for design-system
export function useIsDarkMode() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function useColorScheme() {
  return useIsDarkMode() ? 'dark' : 'light';
}
