import * as React from 'react';
import { cn } from '@/utils/cn';

interface OverlayProps extends React.HTMLAttributes<HTMLDivElement> {
  show?: boolean;
  onClose?: () => void;
  blur?: boolean;
}

export function Overlay({ show = true, onClose, blur = false, className, children, ...props }: OverlayProps) {
  if (!show) return null;

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 bg-black/50 transition-opacity',
        blur && 'backdrop-blur-sm',
        className
      )}
      onClick={onClose}
      {...props}
    >
      {children}
    </div>
  );
}
