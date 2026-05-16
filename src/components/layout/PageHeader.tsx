import { ReactNode } from 'react';
import { cn } from '@/utils/cn';
import { BackButton } from '@/components/navigation/BackButton';

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
  showBackButton?: boolean;
}

export function PageHeader({ 
  title, 
  description, 
  actions, 
  children, 
  className,
  showBackButton = true
}: PageHeaderProps) {
  return (
    <div className={cn('flex flex-col gap-4 mb-6 animate-in fade-in slide-in-from-top-2 duration-500', className)}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col gap-1">
          {showBackButton && (
            <BackButton className="-ml-2 mb-1 self-start" />
          )}
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
          {description && <p className="text-muted-foreground text-sm max-w-2xl leading-relaxed">{description}</p>}
        </div>
        {(actions || children) && (
          <div className="flex items-center gap-2 shrink-0">
            {actions || children}
          </div>
        )}
      </div>
    </div>
  );
}
