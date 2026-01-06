import * as React from 'react';
import { createContext, useContext, useEffect, useRef, useCallback } from 'react';

interface FocusManagerContextValue { trapFocus: (container: HTMLElement) => () => void; restoreFocus: () => void; moveFocus: (direction: 'next' | 'prev') => void; }
const FocusManagerContext = createContext<FocusManagerContextValue | null>(null);

const FOCUSABLE_SELECTOR = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function FocusManagerProvider({ children }: { children: React.ReactNode }) {
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const trapContainerRef = useRef<HTMLElement | null>(null);

  const getFocusableElements = useCallback((container: HTMLElement) => Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(el => el.offsetParent !== null), []);

  const trapFocus = useCallback((container: HTMLElement) => {
    previousFocusRef.current = document.activeElement as HTMLElement;
    trapContainerRef.current = container;
    const focusable = getFocusableElements(container);
    if (focusable.length) focusable[0].focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const focusable = getFocusableElements(container);
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    container.addEventListener('keydown', handleKeyDown);
    return () => { container.removeEventListener('keydown', handleKeyDown); trapContainerRef.current = null; };
  }, [getFocusableElements]);

  const restoreFocus = useCallback(() => { previousFocusRef.current?.focus(); previousFocusRef.current = null; }, []);

  const moveFocus = useCallback((direction: 'next' | 'prev') => {
    const container = trapContainerRef.current || document.body;
    const focusable = getFocusableElements(container);
    const currentIndex = focusable.indexOf(document.activeElement as HTMLElement);
    const nextIndex = direction === 'next' ? (currentIndex + 1) % focusable.length : (currentIndex - 1 + focusable.length) % focusable.length;
    focusable[nextIndex]?.focus();
  }, [getFocusableElements]);

  return <FocusManagerContext.Provider value={{ trapFocus, restoreFocus, moveFocus }}>{children}</FocusManagerContext.Provider>;
}

export function useFocusManager() { const context = useContext(FocusManagerContext); if (!context) throw new Error('useFocusManager must be used within FocusManagerProvider'); return context; }
export default FocusManagerProvider;
