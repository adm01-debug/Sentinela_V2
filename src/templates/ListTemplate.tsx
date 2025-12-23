import React from 'react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter, Plus } from 'lucide-react';

interface ListTemplateProps { title: string; onSearch?: (value: string) => void; onFilter?: () => void; onAdd?: () => void; addLabel?: string; children: React.ReactNode; className?: string; }

export function ListTemplate({ title, onSearch, onFilter, onAdd, addLabel = 'Adicionar', children, className }: ListTemplateProps) {
  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{title}</h1>
        {onAdd && <Button onClick={onAdd}><Plus className="h-4 w-4 mr-2" />{addLabel}</Button>}
      </div>
      <div className="flex gap-2">
        {onSearch && <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Buscar..." className="pl-9" onChange={e => onSearch(e.target.value)} /></div>}
        {onFilter && <Button variant="outline" onClick={onFilter}><Filter className="h-4 w-4 mr-2" />Filtros</Button>}
      </div>
      <div>{children}</div>
    </div>
  );
}
