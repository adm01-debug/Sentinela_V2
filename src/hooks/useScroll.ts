import { useState, useEffect } from 'react';
export function useScroll() {
  const [scroll, setScroll] = useState({ x: 0, y: 0 });
  useEffect(() => { const handler = () => setScroll({ x: window.scrollX, y: window.scrollY }); window.addEventListener('scroll', handler); return () => window.removeEventListener('scroll', handler); }, []);
  return scroll;
}