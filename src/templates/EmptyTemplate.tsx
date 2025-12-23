import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { FileX } from 'lucide-react';

interface EmptyTemplateProps { title: string; description?: string; icon?: React.ReactNode; action?: { label: string; onClick: () => void }; className?: string; }

export function EmptyTemplate({ title, description, icon, action, className }: EmptyTemplateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 text-center', className)}>
      <div className="mb-4 text-muted-foreground">{icon || <FileX className="h-12 w-12" />}</div>
      <h3 className="text-lg font-semibold">{title}</h3>
      {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
      {action && <Button onClick={action.onClick} className="mt-4">{action.label}</Button>}
    </div>
  );
}
