import * as React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/utils/cn';

interface TagProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  removable?: boolean;
  onRemove?: () => void;
}

const variantStyles = {
  default: 'bg-muted text-muted-foreground',
  primary: 'bg-primary/10 text-primary',
  secondary: 'bg-secondary text-secondary-foreground',
  success: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
  warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
  danger: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
};

const sizeStyles = { sm: 'text-xs px-2 py-0.5', md: 'text-sm px-2.5 py-1', lg: 'text-base px-3 py-1.5' };

export function Tag({ className, variant = 'default', size = 'md', removable, onRemove, children, ...props }: TagProps) {
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full font-medium', variantStyles[variant], sizeStyles[size], className)} {...props}>
      {children}
      {removable && (
        <button type="button" onClick={onRemove} className="ml-1 rounded-full p-0.5 hover:bg-black/10 dark:hover:bg-white/10">
          <X className="h-3 w-3" />
        </button>
      )}
    </span>
  );
}
