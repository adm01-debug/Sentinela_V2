import { ReactNode } from 'react';
import { cn } from '@/utils/cn';

interface BadgeProps { children: ReactNode; variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning'; className?: string; }

export const Badge = ({ children, variant = 'default', className }: BadgeProps) => {
  const variants = {
    default: 'bg-primary text-primary-foreground',
    secondary: 'bg-secondary text-secondary-foreground',
    destructive: 'bg-destructive text-destructive-foreground',
    outline: 'text-foreground border border-input',
    success: 'bg-green-500 text-white',
    warning: 'bg-yellow-500 text-white',
  };
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold', variants[variant], className)}>
      {children}
    </span>
  );
};