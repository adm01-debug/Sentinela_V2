import { useState, useCallback, useRef } from 'react';

export function useCollapse(defaultOpen = false) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const ref = useRef<HTMLDivElement>(null);
  const toggle = useCallback(() => setIsOpen(p => !p), []);
  return { isOpen, toggle, open: () => setIsOpen(true), close: () => setIsOpen(false), ref };
}