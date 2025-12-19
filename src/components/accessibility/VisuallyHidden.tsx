import { ReactNode, HTMLAttributes, memo } from 'react';
import { cn } from '@/lib/utils';

// ============================================================
// VISUALLY HIDDEN COMPONENT
// Hides content visually but keeps it accessible to screen readers
// ============================================================

interface VisuallyHiddenProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  as?: 'span' | 'div' | 'label';
  focusable?: boolean;
}

export const VisuallyHidden = memo(function VisuallyHidden({
  children,
  as: Component = 'span',
  focusable = false,
  className,
  ...props
}: VisuallyHiddenProps) {
  return (
    <Component
      className={cn(
        // Visually hidden but accessible
        'absolute',
        'w-[1px]',
        'h-[1px]',
        'p-0',
        'm-[-1px]',
        'overflow-hidden',
        'whitespace-nowrap',
        'border-0',
        '[clip:rect(0,0,0,0)]',
        // Show on focus if focusable
        focusable && [
          'focus:static',
          'focus:w-auto',
          'focus:h-auto',
          'focus:m-0',
          'focus:overflow-visible',
          'focus:whitespace-normal',
          'focus:[clip:auto]',
        ],
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
});

export default VisuallyHidden;
