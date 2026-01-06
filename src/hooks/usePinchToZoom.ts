import { useState, useRef, useCallback, TouchEvent } from 'react';

export interface UsePinchToZoomOptions {
  minScale?: number;
  maxScale?: number;
  initialScale?: number;
}

export function usePinchToZoom(options: UsePinchToZoomOptions = {}) {
  const { minScale = 0.5, maxScale = 4, initialScale = 1 } = options;
  const [scale, setScale] = useState(initialScale);
  const [origin, setOrigin] = useState({ x: 0, y: 0 });
  const initialDistance = useRef<number | null>(null);
  const initialScale = useRef(scale);

  const getDistance = (touches: TouchList) => {
    const [t1, t2] = [touches[0], touches[1]];
    return Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
  };

  const getCenter = (touches: TouchList) => {
    const [t1, t2] = [touches[0], touches[1]];
    return { x: (t1.clientX + t2.clientX) / 2, y: (t1.clientY + t2.clientY) / 2 };
  };

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (e.touches.length === 2) {
      initialDistance.current = getDistance(e.touches);
      initialScale.current = scale;
      setOrigin(getCenter(e.touches));
    }
  }, [scale]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (e.touches.length === 2 && initialDistance.current) {
      const currentDistance = getDistance(e.touches);
      const newScale = (currentDistance / initialDistance.current) * initialScale.current;
      setScale(Math.max(minScale, Math.min(maxScale, newScale)));
      setOrigin(getCenter(e.touches));
    }
  }, [minScale, maxScale]);

  const handleTouchEnd = useCallback(() => { initialDistance.current = null; }, []);

  const resetZoom = useCallback(() => { setScale(1); setOrigin({ x: 0, y: 0 }); }, []);

  return { scale, origin, resetZoom, handlers: { onTouchStart: handleTouchStart, onTouchMove: handleTouchMove, onTouchEnd: handleTouchEnd }, style: { transform: `scale(${scale})`, transformOrigin: `${origin.x}px ${origin.y}px` } };
}

export default usePinchToZoom;
