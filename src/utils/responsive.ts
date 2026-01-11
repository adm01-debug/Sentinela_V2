export const breakpoints = { sm: 640, md: 768, lg: 1024, xl: 1280, '2xl': 1536 } as const;
export const isMobile = () => typeof window !== 'undefined' && window.innerWidth < breakpoints.md;
export const isTablet = () => typeof window !== 'undefined' && window.innerWidth >= breakpoints.md && window.innerWidth < breakpoints.lg;
export const isDesktop = () => typeof window !== 'undefined' && window.innerWidth >= breakpoints.lg;
export const getBreakpoint = () => { const w = typeof window !== 'undefined' ? window.innerWidth : 0; if (w < breakpoints.sm) return 'xs'; if (w < breakpoints.md) return 'sm'; if (w < breakpoints.lg) return 'md'; if (w < breakpoints.xl) return 'lg'; return 'xl'; };
