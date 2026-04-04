import { useState, useCallback } from 'react';

export function useAccordion(defaultOpen?: string) {
  const [openItem, setOpenItem] = useState<string | undefined>(defaultOpen);
  const toggle = useCallback((id) => setOpenItem(prev => prev === id ? undefined : id), []);
  const isOpen = useCallback((id) => openItem === id, [openItem]);
  return { openItem, toggle, isOpen, close: () => setOpenItem(undefined) };
}