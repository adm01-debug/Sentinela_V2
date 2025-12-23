import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Filter } from 'lucide-react';

interface FilterModalProps { isOpen: boolean; onClose: () => void; onApply: () => void; onClear: () => void; children: React.ReactNode; }

export function FilterModal({ isOpen, onClose, onApply, onClear, children }: FilterModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader><div className="flex items-center gap-2"><Filter className="h-5 w-5" /><DialogTitle>Filtros</DialogTitle></div></DialogHeader>
        <div className="py-4 space-y-4">{children}</div>
        <DialogFooter className="flex justify-between">
          <Button variant="ghost" onClick={onClear}>Limpar Filtros</Button>
          <div className="flex gap-2"><Button variant="outline" onClick={onClose}>Cancelar</Button><Button onClick={() => { onApply(); onClose(); }}>Aplicar</Button></div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
