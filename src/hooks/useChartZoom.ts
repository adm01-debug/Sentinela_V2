import { useState, useCallback, useMemo } from 'react';

export interface ZoomState {
  domain: { x: [number, number]; y: [number, number] } | null;
  scale: number;
}

export interface UseChartZoomOptions {
  minScale?: number;
  maxScale?: number;
  initialDomain?: { x: [number, number]; y: [number, number] };
}

export function useChartZoom(options: UseChartZoomOptions = {}) {
  const { minScale = 0.5, maxScale = 10, initialDomain } = options;
  const [zoomState, setZoomState] = useState<ZoomState>({ domain: initialDomain || null, scale: 1 });
  const [isPanning, setIsPanning] = useState(false);

  const zoomIn = useCallback((factor = 1.2) => {
    setZoomState(prev => ({ ...prev, scale: Math.min(maxScale, prev.scale * factor) }));
  }, [maxScale]);

  const zoomOut = useCallback((factor = 1.2) => {
    setZoomState(prev => ({ ...prev, scale: Math.max(minScale, prev.scale / factor) }));
  }, [minScale]);

  const resetZoom = useCallback(() => {
    setZoomState({ domain: initialDomain || null, scale: 1 });
  }, [initialDomain]);

  const setDomain = useCallback((domain: { x: [number, number]; y: [number, number] }) => {
    setZoomState(prev => ({ ...prev, domain }));
  }, []);

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) zoomIn();
    else zoomOut();
  }, [zoomIn, zoomOut]);

  return { ...zoomState, zoomIn, zoomOut, resetZoom, setDomain, isPanning, setIsPanning, handleWheel };
}

export default useChartZoom;
