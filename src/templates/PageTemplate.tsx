import React from 'react';
import { cn } from '@/lib/utils';

interface PageTemplateProps { title: string; description?: string; actions?: React.ReactNode; children: React.ReactNode; className?: string; }

export function PageTemplate({ title, description, actions, children, className }: PageTemplateProps) {
  return (
    <div className={cn('space-y-6', className)}>
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold tracking-tight">{title}</h1>{description && <p className="text-muted-foreground">{description}</p>}</div>
        {actions && <div className="flex gap-2">{actions}</div>}
      </div>
      <div>{children}</div>
    </div>
  );
}
