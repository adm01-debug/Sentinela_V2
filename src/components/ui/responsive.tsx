import { useMediaQuery } from '@/hooks/useMediaQuery';

interface ResponsiveProps {
  children: React.ReactNode;
  breakpoint: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  show?: 'above' | 'below';
}

const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

export function Responsive({ children, breakpoint, show = 'above' }: ResponsiveProps) {
  const isAbove = useMediaQuery(`(min-width: ${breakpoints[breakpoint]}px)`);
  const shouldShow = show === 'above' ? isAbove : !isAbove;
  
  return shouldShow ? <>{children}</> : null;
}

export function MobileOnly({ children }: { children: React.ReactNode }) {
  return <Responsive breakpoint="md" show="below">{children}</Responsive>;
}

export function DesktopOnly({ children }: { children: React.ReactNode }) {
  return <Responsive breakpoint="md" show="above">{children}</Responsive>;
}
