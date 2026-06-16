import { useState, useRef, useEffect } from "react";

interface Dimensions {
  width: number;
  height: number;
  top: number;
  left: number;
  bottom: number;
  right: number;
}

export function useMeasure<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [dimensions, setDimensions] = useState<Dimensions>({
    width: 0,
    height: 0,
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new ResizeObserver(([entry]) => {
      const rect = entry.target.getBoundingClientRect();
      setDimensions({
        width: rect.width,
        height: rect.height,
        top: rect.top,
        left: rect.left,
        bottom: rect.bottom,
        right: rect.right,
      });
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, ...dimensions };
}
