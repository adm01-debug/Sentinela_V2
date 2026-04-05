import { memo, type ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
  };
  className?: string;
  children?: ReactNode;
}

export const EmptyState = memo(function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  children,
}: EmptyStateProps) {
  const ActionIcon = action?.icon;

  return (
    <div className={cn(
      'flex flex-col items-center justify-center py-16 px-6 text-center',
      className
    )}>
      {/* Branded icon container */}
      <div className="relative mb-6">
        <div className="absolute inset-0 rounded-full bg-primary/10 blur-xl scale-150" />
        <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/15 to-accent/15 border border-primary/10">
          <Icon className="h-7 w-7 text-primary" />
        </div>
      </div>

      <h3 className="text-lg font-semibold text-foreground mb-1.5">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-6">{description}</p>

      {action && (
        <Button onClick={action.onClick} className="gap-2">
          {ActionIcon && <ActionIcon className="h-4 w-4" />}
          {action.label}
        </Button>
      )}

      {children}
    </div>
  );
});

export default EmptyState;
