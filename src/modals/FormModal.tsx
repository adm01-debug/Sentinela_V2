import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface FormModalProps { isOpen: boolean; onClose: () => void; onSubmit: () => void; title: string; children: React.ReactNode; submitText?: string; isLoading?: boolean; }

export function FormModal({ isOpen, onClose, onSubmit, title, children, submitText = 'Salvar', isLoading = false }: FormModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader><DialogTitle>{title}</DialogTitle></DialogHeader>
        <div className="py-4">{children}</div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>Cancelar</Button>
          <Button onClick={onSubmit} disabled={isLoading}>{isLoading ? 'Salvando...' : submitText}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
