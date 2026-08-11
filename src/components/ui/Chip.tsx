import * as React from 'react';
import { Check, X } from 'lucide-react';
import { cn } from '@/utils/cn';

interface ChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
  removable?: boolean;
  onRemove?: () => void;
  variant?: 'default' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

const sizeStyles = { sm: 'h-7 text-xs px-2', md: 'h-8 text-sm px-3', lg: 'h-9 text-base px-4' };

export function Chip({ className, selected, removable, onRemove, variant = 'default', size = 'md', children, ...props }: ChipProps) {
  return (
    <button
      type="button"
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        sizeStyles[size],
        variant === 'default' && (selected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'),
        variant === 'outline' && (selected ? 'border-2 border-primary text-primary' : 'border border-input hover:bg-accent'),
        className
      )}
      {...props}
    >
      {selected && <Check className="h-3.5 w-3.5" />}
      {children}
      {removable && (
        <span onClick={(e) => { e.stopPropagation(); onRemove?.(); }} className="ml-1 rounded-full p-0.5 hover:bg-black/10">
          <X className="h-3 w-3" />
        </span>
      )}
    </button>
  );
}
