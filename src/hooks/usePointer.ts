import { useState, useEffect } from "react";

interface PointerState {
  x: number;
  y: number;
  pressure: number;
  pointerType: string;
}

export function usePointer() {
  const [state, setState] = useState<PointerState>({
    x: 0, y: 0, pressure: 0, pointerType: "mouse"
  });

  useEffect(() => {
    const handler = (e: PointerEvent) => {
      setState({
        x: e.clientX,
        y: e.clientY,
        pressure: e.pressure,
        pointerType: e.pointerType
      });
    };

    window.addEventListener("pointermove", handler);
    return () => window.removeEventListener("pointermove", handler);
  }, []);

  return state;
}
