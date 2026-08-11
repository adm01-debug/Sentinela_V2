import { useState, useCallback } from 'react';

export function useDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [side, setSide] = useState<'left' | 'right'>('left');
  const open = useCallback((s: 'left' | 'right' = 'left') => { setSide(s); setIsOpen(true); }, []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen(p => !p), []);
  return { isOpen, side, open, close, toggle };
}