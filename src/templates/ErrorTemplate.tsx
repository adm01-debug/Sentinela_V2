import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorTemplateProps { title?: string; message?: string; onRetry?: () => void; className?: string; }

export function ErrorTemplate({ title = 'Algo deu errado', message = 'Ocorreu um erro inesperado. Por favor, tente novamente.', onRetry, className }: ErrorTemplateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 text-center', className)}>
      <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground mt-1 max-w-md">{message}</p>
      {onRetry && <Button onClick={onRetry} className="mt-4"><RefreshCw className="h-4 w-4 mr-2" />Tentar Novamente</Button>}
    </div>
  );
}
