import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react';

type AlertType = 'info' | 'success' | 'warning' | 'error';

interface AlertModalProps { isOpen: boolean; onClose: () => void; type: AlertType; title: string; message: string; }

const icons: Record<AlertType, React.ReactNode> = { info: <Info className="h-6 w-6 text-blue-500" />, success: <CheckCircle className="h-6 w-6 text-green-500" />, warning: <AlertCircle className="h-6 w-6 text-yellow-500" />, error: <XCircle className="h-6 w-6 text-red-500" /> };

export function AlertModal({ isOpen, onClose, type, title, message }: AlertModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader><div className="flex items-center gap-2">{icons[type]}<DialogTitle>{title}</DialogTitle></div></DialogHeader>
        <p className="text-muted-foreground">{message}</p>
        <DialogFooter><Button onClick={onClose}>OK</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
