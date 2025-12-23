import { useEffect, RefObject } from 'react';
export function useFocus<T extends HTMLElement>(ref: RefObject<T>, shouldFocus = true) {
  useEffect(() => { if (shouldFocus && ref.current) ref.current.focus(); }, [ref, shouldFocus]);
}
export function useFocusTrap<T extends HTMLElement>(ref: RefObject<T>) {
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const focusable = el.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    const first = focusable[0] as HTMLElement, last = focusable[focusable.length - 1] as HTMLElement;
    const handler = (e: KeyboardEvent) => { if (e.key !== 'Tab') return; if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); } else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); } };
    el.addEventListener('keydown', handler);
    return () => el.removeEventListener('keydown', handler);
  }, [ref]);
}
