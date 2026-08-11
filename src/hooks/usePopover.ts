import { useState, useCallback, useRef } from 'react';
export function usePopover() {
  const [isOpen, setIsOpen] = useState(false);
  const anchorRef = useRef<HTMLElement>(null);
  const toggle = useCallback(() => setIsOpen(p => !p), []);
  const close = useCallback(() => setIsOpen(false), []);
  return { isOpen, toggle, close, anchorRef };
}