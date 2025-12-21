import { useEffect, RefObject } from 'react';
export function useMutationObserver(ref: RefObject<HTMLElement>, callback: MutationCallback, options?: MutationObserverInit) {
  useEffect(() => { if (!ref.current) return; const obs = new MutationObserver(callback); obs.observe(ref.current, options || { childList: true, subtree: true }); return () => obs.disconnect(); }, [ref, callback, options]);
}