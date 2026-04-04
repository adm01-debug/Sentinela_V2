import { useState, useCallback } from "react";

interface Transform { x: number; y: number; scale: number; rotation: number; }

export function useTransform(initial: Partial<Transform> = {}) {
  const [transform, setTransform] = useState<Transform>({
    x: 0, y: 0, scale: 1, rotation: 0, ...initial
  });

  const translate = useCallback((x: number, y: number) => {
    setTransform(t => ({ ...t, x: t.x + x, y: t.y + y }));
  }, []);

  const scale = useCallback((factor) => {
    setTransform(t => ({ ...t, scale: t.scale * factor }));
  }, []);

  const rotate = useCallback((degrees) => {
    setTransform(t => ({ ...t, rotation: (t.rotation + degrees) % 360 }));
  }, []);

  const reset = useCallback(() => setTransform({ x: 0, y: 0, scale: 1, rotation: 0 }), []);

  const style = { transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale}) rotate(${transform.rotation}deg)` };

  return { transform, translate, scale, rotate, reset, style };
}
