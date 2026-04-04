import { useState, useCallback, useRef, useEffect } from 'react';

interface HeatmapPoint { x: number; y: number; value: number; }

export function useHeatmap(elementId?: string) {
  const [points, setPoints] = useState<HeatmapPoint[]>([]);
  const [isTracking, setIsTracking] = useState(false);
  const containerRef = useRef<HTMLElement | null>(null);

  const startTracking = useCallback(() => {
    setIsTracking(true);
    setPoints([]);
  }, []);

  const stopTracking = useCallback(() => setIsTracking(false), []);

  const recordPoint = useCallback((x, y) => {
    if (!isTracking) return;
    setPoints(prev => {
      const existing = prev.find(p => Math.abs(p.x - x) < 10 && Math.abs(p.y - y) < 10);
      if (existing) return prev.map(p => p === existing ? { ...p, value: p.value + 1 } : p);
      return [...prev, { x, y, value: 1 }];
    });
  }, [isTracking]);

  useEffect(() => {
    if (!isTracking) return;
    const element = elementId ? document.getElementById(elementId) : document;
    if (!element) return;
    
    const handleClick = (e: MouseEvent) => {
      const rect = element === document ? { left: 0, top: 0 } : (element as HTMLElement).getBoundingClientRect();
      recordPoint(e.clientX - rect.left, e.clientY - rect.top);
    };
    element.addEventListener('click', handleClick as EventListener);
    return () => element.removeEventListener('click', handleClick as EventListener);
  }, [isTracking, elementId, recordPoint]);

  const getHotspots = useCallback((threshold = 5) => points.filter(p => p.value >= threshold).sort((a, b) => b.value - a.value), [points]);
  const clear = useCallback(() => setPoints([]), []);

  return { points, isTracking, startTracking, stopTracking, recordPoint, getHotspots, clear };
}
export default useHeatmap;
