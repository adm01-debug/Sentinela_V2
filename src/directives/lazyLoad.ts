import { useState, useEffect, RefObject } from 'react';
export function useLazyLoad<T extends HTMLElement>(ref: RefObject<T>, rootMargin = '100px') {
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setIsVisible(true); observer.disconnect(); } }, { rootMargin });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref, rootMargin]);
  return isVisible;
}
