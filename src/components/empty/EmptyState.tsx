import { ReactNode } from 'react';
import { cn } from '@/utils/cn';
import { Button } from '@/components/ui/button';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 px-4 text-center', className)}>
      <div className="mb-4 text-muted-foreground">{icon || <Inbox className="h-12 w-12" />}</div>
      <h3 className="text-lg font-medium mb-1">{title}</h3>
      {description && <p className="text-muted-foreground mb-4 max-w-sm">{description}</p>}
      {action && <Button onClick={action.onClick}>{action.label}</Button>}
    </div>
  );
}
