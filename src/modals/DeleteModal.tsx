import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

interface DeleteModalProps { isOpen: boolean; onClose: () => void; onConfirm: () => void; itemName: string; isLoading?: boolean; }

export function DeleteModal({ isOpen, onClose, onConfirm, itemName, isLoading = false }: DeleteModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-2 text-destructive"><Trash2 className="h-5 w-5" /><DialogTitle>Excluir Item</DialogTitle></div>
          <DialogDescription>Tem certeza que deseja excluir "{itemName}"? Esta ação não pode ser desfeita.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>Cancelar</Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isLoading}>{isLoading ? 'Excluindo...' : 'Excluir'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
