import { useState, useEffect } from 'react';

const breakpoints = { sm: 640, md: 768, lg: 1024, xl: 1280 };

export function useBreakpoint() {
  const [breakpoint, setBreakpoint] = useState('');
  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      if (w >= breakpoints.xl) setBreakpoint('xl');
      else if (w >= breakpoints.lg) setBreakpoint('lg');
      else if (w >= breakpoints.md) setBreakpoint('md');
      else if (w >= breakpoints.sm) setBreakpoint('sm');
      else setBreakpoint('xs');
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);
  return breakpoint;
}