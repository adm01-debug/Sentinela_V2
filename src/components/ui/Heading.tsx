import * as React from 'react';
import { cn } from '@/utils/cn';

type HeadingLevel = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: HeadingLevel;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
}

const sizeClasses = {
  xs: 'text-xs font-medium',
  sm: 'text-sm font-medium',
  md: 'text-base font-semibold',
  lg: 'text-lg font-semibold',
  xl: 'text-xl font-bold',
  '2xl': 'text-2xl font-bold',
  '3xl': 'text-3xl font-bold',
  '4xl': 'text-4xl font-bold tracking-tight',
};

export function Heading({ as: Component = 'h2', size = 'lg', className, children, ...props }: HeadingProps) {
  return (
    <Component className={cn('text-foreground', sizeClasses[size], className)} {...props}>
      {children}
    </Component>
  );
}
