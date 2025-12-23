import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';

interface DetailTemplateProps { title: string; subtitle?: string; onBack?: () => void; onEdit?: () => void; onDelete?: () => void; children: React.ReactNode; className?: string; }

export function DetailTemplate({ title, subtitle, onBack, onEdit, onDelete, children, className }: DetailTemplateProps) {
  return (
    <div className={cn('space-y-6', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {onBack && <Button variant="ghost" size="icon" onClick={onBack}><ArrowLeft className="h-4 w-4" /></Button>}
          <div><h1 className="text-2xl font-bold">{title}</h1>{subtitle && <p className="text-muted-foreground">{subtitle}</p>}</div>
        </div>
        <div className="flex gap-2">
          {onEdit && <Button variant="outline" onClick={onEdit}><Edit className="h-4 w-4 mr-2" />Editar</Button>}
          {onDelete && <Button variant="destructive" onClick={onDelete}><Trash2 className="h-4 w-4 mr-2" />Excluir</Button>}
        </div>
      </div>
      <div>{children}</div>
    </div>
  );
}
