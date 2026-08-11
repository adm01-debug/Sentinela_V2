import { useState, useCallback } from "react";

export function usePinch() {
  const [scale, setScale] = useState(1);
  const [isPinching, setIsPinching] = useState(false);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) setIsPinching(true);
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isPinching || e.touches.length !== 2) return;
    
    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    setScale(Math.max(0.5, Math.min(3, distance / 100)));
  }, [isPinching]);

  const onTouchEnd = useCallback(() => setIsPinching(false), []);

  return { scale, isPinching, onTouchStart, onTouchMove, onTouchEnd };
}
