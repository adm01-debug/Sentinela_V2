import { useState, useRef, useEffect } from "react";

export function useOnScreen<T extends HTMLElement>(threshold = 0.1) {
  const ref = useRef<T>(null);
  const [isOnScreen, setIsOnScreen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsOnScreen(entry.isIntersecting),
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isOnScreen };
}
