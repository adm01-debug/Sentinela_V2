import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Download } from 'lucide-react';

interface ExportModalProps { isOpen: boolean; onClose: () => void; onExport: (format: string) => void; formats?: string[]; }

export function ExportModal({ isOpen, onClose, onExport, formats = ['csv', 'xlsx', 'pdf'] }: ExportModalProps) {
  const [format, setFormat] = useState(formats[0]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader><div className="flex items-center gap-2"><Download className="h-5 w-5" /><DialogTitle>Exportar Dados</DialogTitle></div></DialogHeader>
        <RadioGroup value={format} onValueChange={setFormat} className="space-y-2">
          {formats.map(f => (<div key={f} className="flex items-center space-x-2"><RadioGroupItem value={f} id={f} /><Label htmlFor={f}>{f.toUpperCase()}</Label></div>))}
        </RadioGroup>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={() => { onExport(format); onClose(); }}>Exportar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
