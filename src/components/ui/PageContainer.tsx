import { memo } from 'react';
import { cn } from '@/lib/utils';

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

function PageContainerComponent({ children, className }: PageContainerProps) {
  return (
    <div className={cn("flex-1 space-y-6 p-6", className)}>
      {children}
    </div>
  );
}

export const PageContainer = memo(PageContainerComponent);
