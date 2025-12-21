import { useState, useEffect, RefObject } from 'react';
export function useIntersection(ref: RefObject<HTMLElement>, options?: IntersectionObserverInit) {
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);
  useEffect(() => { if (!ref.current) return; const obs = new IntersectionObserver(([e]) => setEntry(e), options); obs.observe(ref.current); return () => obs.disconnect(); }, [ref, options]);
  return entry;
}