import { useState, useEffect, useRef } from "react";

interface MouseState {
  x: number;
  y: number;
  elementX: number;
  elementY: number;
}

export function useMouse<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [state, setState] = useState<MouseState>({ x: 0, y: 0, elementX: 0, elementY: 0 });

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const rect = ref.current?.getBoundingClientRect();
      setState({
        x: e.clientX,
        y: e.clientY,
        elementX: rect ? e.clientX - rect.left : 0,
        elementY: rect ? e.clientY - rect.top : 0
      });
    };

    document.addEventListener("mousemove", handler);
    return () => document.removeEventListener("mousemove", handler);
  }, []);

  return { ref, ...state };
}
