import { useState, useCallback } from 'react';

export function useModal(initialState = false) {
  const [isOpen, setIsOpen] = useState(initialState);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen(prev => !prev), []);

  return { isOpen, open, close, toggle, setIsOpen };
}

export function useConfirmModal<T = void>() {
  const { isOpen, open, close } = useModal();
  const [data, setData] = useState<T | null>(null);
  const [onConfirm, setOnConfirm] = useState<(() => void) | null>(null);

  const show = useCallback((confirmData: T, confirmFn: () => void) => { setData(confirmData); setOnConfirm(() => confirmFn); open(); }, [open]);
  const confirm = useCallback(() => { onConfirm?.(); close(); }, [onConfirm, close]);

  return { isOpen, data, show, confirm, close };
}
