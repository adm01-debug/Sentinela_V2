import { createContext, useContext, ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/utils/cn';

interface DialogProps { open: boolean; onClose: () => void; children: ReactNode; }

export const Dialog = ({ open, onClose, children }: DialogProps) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-50 w-full max-w-lg rounded-lg bg-background p-6 shadow-lg">{children}</div>
    </div>
  );
};

export const DialogHeader = ({ children }: { children: ReactNode }) => (
  <div className="flex items-center justify-between mb-4">{children}</div>
);

export const DialogTitle = ({ children }: { children: ReactNode }) => (
  <h2 className="text-lg font-semibold">{children}</h2>
);

export const DialogContent = ({ children }: { children: ReactNode }) => (
  <div className="space-y-4">{children}</div>
);

export const DialogFooter = ({ children }: { children: ReactNode }) => (
  <div className="flex justify-end gap-2 mt-6">{children}</div>
);