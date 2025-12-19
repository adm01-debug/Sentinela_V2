import { useState, useEffect, useMemo } from 'react';

// ============================================================
// useMediaQuery - Listen to media query changes
// ============================================================

/**
 * Returns true if the media query matches
 * @param query - CSS media query string
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);

    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    }
    
    // Legacy support
    mediaQuery.addListener(handler);
    return () => mediaQuery.removeListener(handler);
  }, [query]);

  return matches;
}

// ============================================================
// Preset breakpoint hooks (Tailwind CSS defaults)
// ============================================================

/**
 * Returns true if viewport is at least 640px (sm breakpoint)
 */
export function useIsSmScreen(): boolean {
  return useMediaQuery('(min-width: 640px)');
}

/**
 * Returns true if viewport is at least 768px (md breakpoint)
 */
export function useIsMdScreen(): boolean {
  return useMediaQuery('(min-width: 768px)');
}

/**
 * Returns true if viewport is at least 1024px (lg breakpoint)
 */
export function useIsLgScreen(): boolean {
  return useMediaQuery('(min-width: 1024px)');
}

/**
 * Returns true if viewport is at least 1280px (xl breakpoint)
 */
export function useIsXlScreen(): boolean {
  return useMediaQuery('(min-width: 1280px)');
}

/**
 * Returns true if viewport is at least 1536px (2xl breakpoint)
 */
export function useIs2xlScreen(): boolean {
  return useMediaQuery('(min-width: 1536px)');
}

/**
 * Returns true if viewport is mobile-sized (less than 768px)
 */
export function useIsMobile(): boolean {
  return !useMediaQuery('(min-width: 768px)');
}

/**
 * Returns true if viewport is tablet-sized (768px - 1023px)
 */
export function useIsTablet(): boolean {
  const isMd = useMediaQuery('(min-width: 768px)');
  const isLg = useMediaQuery('(min-width: 1024px)');
  return isMd && !isLg;
}

/**
 * Returns true if viewport is desktop-sized (1024px or more)
 */
export function useIsDesktop(): boolean {
  return useMediaQuery('(min-width: 1024px)');
}

// ============================================================
// useBreakpoint - Get current breakpoint
// ============================================================

type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

/**
 * Returns the current Tailwind breakpoint
 */
export function useBreakpoint(): Breakpoint {
  const is2xl = useMediaQuery('(min-width: 1536px)');
  const isXl = useMediaQuery('(min-width: 1280px)');
  const isLg = useMediaQuery('(min-width: 1024px)');
  const isMd = useMediaQuery('(min-width: 768px)');
  const isSm = useMediaQuery('(min-width: 640px)');

  if (is2xl) return '2xl';
  if (isXl) return 'xl';
  if (isLg) return 'lg';
  if (isMd) return 'md';
  if (isSm) return 'sm';
  return 'xs';
}

// ============================================================
// Other useful media queries
// ============================================================

/**
 * Returns true if user prefers dark mode
 */
export function usePrefersDarkMode(): boolean {
  return useMediaQuery('(prefers-color-scheme: dark)');
}

/**
 * Returns true if user prefers reduced motion
 */
export function usePrefersReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}

/**
 * Returns true if user prefers high contrast
 */
export function usePrefersHighContrast(): boolean {
  return useMediaQuery('(prefers-contrast: high)');
}

/**
 * Returns true if device is in portrait orientation
 */
export function useIsPortrait(): boolean {
  return useMediaQuery('(orientation: portrait)');
}

/**
 * Returns true if device is in landscape orientation
 */
export function useIsLandscape(): boolean {
  return useMediaQuery('(orientation: landscape)');
}

/**
 * Returns true if device supports hover (not touch-only)
 */
export function useCanHover(): boolean {
  return useMediaQuery('(hover: hover)');
}

/**
 * Returns true if device is touch-capable
 */
export function useIsTouchDevice(): boolean {
  return useMediaQuery('(pointer: coarse)');
}

// ============================================================
// useResponsiveValue - Return value based on breakpoint
// ============================================================

interface ResponsiveValues<T> {
  xs?: T;
  sm?: T;
  md?: T;
  lg?: T;
  xl?: T;
  '2xl'?: T;
}

/**
 * Returns a value based on current breakpoint
 * Falls back to smaller breakpoint values if not specified
 */
export function useResponsiveValue<T>(values: ResponsiveValues<T>, defaultValue: T): T {
  const breakpoint = useBreakpoint();
  
  const breakpointOrder: Breakpoint[] = ['2xl', 'xl', 'lg', 'md', 'sm', 'xs'];
  const currentIndex = breakpointOrder.indexOf(breakpoint);

  // Find the first defined value at or below current breakpoint
  for (let i = currentIndex; i < breakpointOrder.length; i++) {
    const bp = breakpointOrder[i];
    if (values[bp] !== undefined) {
      return values[bp] as T;
    }
  }

  return defaultValue;
}
