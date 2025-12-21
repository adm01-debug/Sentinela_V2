import { useState, useCallback } from 'react';

export function useConfirm() {
  const [isOpen, setIsOpen] = useState(false);
  const [resolver, setResolver] = useState<((v: boolean) => void) | null>(null);
  const confirm = useCallback(() => {
    setIsOpen(true);
    return new Promise<boolean>(resolve => setResolver(() => resolve));
  }, []);
  const handleConfirm = useCallback(() => { resolver?.(true); setIsOpen(false); }, [resolver]);
  const handleCancel = useCallback(() => { resolver?.(false); setIsOpen(false); }, [resolver]);
  return { isOpen, confirm, handleConfirm, handleCancel };
}