import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface FormTemplateProps { title: string; onSubmit: () => void; onCancel?: () => void; submitLabel?: string; isLoading?: boolean; children: React.ReactNode; className?: string; }

export function FormTemplate({ title, onSubmit, onCancel, submitLabel = 'Salvar', isLoading = false, children, className }: FormTemplateProps) {
  return (
    <Card className={cn('max-w-2xl mx-auto', className)}>
      <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
      <CardFooter className="flex justify-end gap-2">
        {onCancel && <Button variant="outline" onClick={onCancel} disabled={isLoading}>Cancelar</Button>}
        <Button onClick={onSubmit} disabled={isLoading}>{isLoading ? 'Salvando...' : submitLabel}</Button>
      </CardFooter>
    </Card>
  );
}
