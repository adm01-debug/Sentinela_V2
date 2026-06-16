import { useState, useCallback } from "react";

type Direction = "left" | "right" | "up" | "down" | null;

export function useSwipe(threshold = 50) {
  const [direction, setDirection] = useState<Direction>(null);
  const [start, setStart] = useState({ x: 0, y: 0 });

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    setStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    setDirection(null);
  }, []);

  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      const end = { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
      const dx = end.x - start.x;
      const dy = end.y - start.y;

      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > threshold) {
        setDirection(dx > 0 ? "right" : "left");
      } else if (Math.abs(dy) > threshold) {
        setDirection(dy > 0 ? "down" : "up");
      }
    },
    [start, threshold]
  );

  return { direction, onTouchStart, onTouchEnd };
}
