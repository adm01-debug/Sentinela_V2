import { useMemo } from 'react';
import { useTheme } from '@/providers/ThemeProvider';

/**
 * Returns resolved chart colors that work in SVG attributes.
 * CSS custom properties via var() don't work in SVG fill/stroke attributes,
 * so we compute the actual HSL values.
 */
export function useChartColors() {
  const { theme } = useTheme();

  return useMemo(() => {
    const root = document.documentElement;
    const style = getComputedStyle(root);

    const resolve = (varName: string): string => {
      const val = style.getPropertyValue(varName).trim();
      return val ? `hsl(${val})` : '#6366f1';
    };

    return {
      primary: resolve('--primary'),
      accent: resolve('--accent'),
      success: resolve('--success'),
      warning: resolve('--warning'),
      info: resolve('--info'),
      destructive: resolve('--destructive'),
      muted: resolve('--muted-foreground'),
      foreground: resolve('--foreground'),
      border: resolve('--border'),
      card: resolve('--card'),
    };
    // theme is intentionally a dependency: it triggers recomputation of the
    // resolved CSS variables when the active theme changes, even though it is
    // not referenced directly inside the callback.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme]);
}
