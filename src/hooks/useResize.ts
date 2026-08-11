import { useState, useEffect, RefObject } from 'react';
export function useResize(ref: RefObject<HTMLElement>) {
  const [size, setSize] = useState({ width: 0, height: 0 });
  useEffect(() => { if (!ref.current) return; const obs = new ResizeObserver(([e]) => setSize({ width: e.contentRect.width, height: e.contentRect.height })); obs.observe(ref.current); return () => obs.disconnect(); }, [ref]);
  return size;
}