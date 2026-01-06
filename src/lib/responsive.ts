import { useState, useEffect } from 'react';

export const breakpoints = { sm: 640, md: 768, lg: 1024, xl: 1280, '2xl': 1536 } as const;
export type Breakpoint = keyof typeof breakpoints;

export function useBreakpoint() {
  const [breakpoint, setBreakpoint] = useState<Breakpoint | null>(null);
  const [width, setWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 0);

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      setWidth(w);
      if (w < breakpoints.sm) setBreakpoint(null);
      else if (w < breakpoints.md) setBreakpoint('sm');
      else if (w < breakpoints.lg) setBreakpoint('md');
      else if (w < breakpoints.xl) setBreakpoint('lg');
      else if (w < breakpoints['2xl']) setBreakpoint('xl');
      else setBreakpoint('2xl');
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    breakpoint,
    width,
    isMobile: width < breakpoints.md,
    isTablet: width >= breakpoints.md && width < breakpoints.lg,
    isDesktop: width >= breakpoints.lg,
    isAtLeast: (bp: Breakpoint) => width >= breakpoints[bp],
    isAtMost: (bp: Breakpoint) => width < breakpoints[bp],
  };
}

export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const media = window.matchMedia(query);
    setMatches(media.matches);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    media.addEventListener('change', handler);
    return () => media.removeEventListener('change', handler);
  }, [query]);
  return matches;
}

export function usePrefersReducedMotion() {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}

export function usePrefersDarkMode() {
  return useMediaQuery('(prefers-color-scheme: dark)');
}

export function useDevicePixelRatio() {
  const [dpr, setDpr] = useState(typeof window !== 'undefined' ? window.devicePixelRatio : 1);
  useEffect(() => {
    const media = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
    const handler = () => setDpr(window.devicePixelRatio);
    media.addEventListener('change', handler);
    return () => media.removeEventListener('change', handler);
  }, []);
  return dpr;
}
