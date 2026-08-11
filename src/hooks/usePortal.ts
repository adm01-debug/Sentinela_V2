import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

export function usePortal(id = 'portal-root') {
  const [container, setContainer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    let el = document.getElementById(id);
    if (!el) { el = document.createElement('div'); el.id = id; document.body.appendChild(el); }
    setContainer(el);
    return () => { if (el && el.childNodes.length === 0) el.remove(); };
  }, [id]);

  const Portal = ({ children }: { children: React.ReactNode }) => 
    container ? createPortal(children, container) : null;

  return Portal;
}