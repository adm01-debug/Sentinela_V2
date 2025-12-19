import { memo } from 'react';
import { cn } from '@/lib/utils';

interface SkipLinkProps {
  href?: string;
  children?: React.ReactNode;
  className?: string;
}

function SkipLinkComponent({ 
  href = '#main-content', 
  children = 'Pular para conteúdo principal',
  className 
}: SkipLinkProps) {
  return (
    <a
      href={href}
      className={cn(
        'sr-only focus:not-sr-only',
        'focus:fixed focus:top-4 focus:left-4 focus:z-[100]',
        'focus:bg-primary focus:text-primary-foreground',
        'focus:px-4 focus:py-2 focus:rounded-md',
        'focus:outline-none focus:ring-2 focus:ring-ring',
        className
      )}
    >
      {children}
    </a>
  );
}

export const SkipLink = memo(SkipLinkComponent);
