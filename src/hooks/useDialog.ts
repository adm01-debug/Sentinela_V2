import { useState, useCallback } from 'react';

export function useDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<unknown>(null);
  const open = useCallback((d?: unknown) => { setData(d); setIsOpen(true); }, []);
  const close = useCallback(() => { setIsOpen(false); setData(null); }, []);
  return { isOpen, data, open, close };
}