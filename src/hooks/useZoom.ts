import { useState, useCallback, useEffect, useRef } from 'react';

interface UseZoomOptions {
  minZoom?: number;
  maxZoom?: number;
  step?: number;
  initialZoom?: number;
  onChange?: (zoom: unknown) => void;
}

interface UseZoomReturn {
  zoom: number;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
  setZoom: (value: number) => void;
  isMinZoom: boolean;
  isMaxZoom: boolean;
  zoomPercentage: string;
  containerRef: React.RefObject<HTMLDivElement>;
  handleWheel: (e: WheelEvent) => void;
  handlePinch: (scale: unknown) => void;
}

export function useZoom(options: UseZoomOptions = {}): UseZoomReturn {
  const {
    minZoom = 0.5,
    maxZoom = 3,
    step = 0.1,
    initialZoom = 1,
    onChange,
  } = options;

  const [zoom, setZoomState] = useState(initialZoom);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastPinchScale = useRef(1);

  const clampZoom = useCallback((value: number): number => {
    return Math.min(Math.max(value, minZoom), maxZoom);
  }, [minZoom, maxZoom]);

  const setZoom = useCallback((value: number) => {
    const clampedValue = clampZoom(value);
    setZoomState(clampedValue);
    onChange?.(clampedValue);
  }, [clampZoom, onChange]);

  const zoomIn = useCallback(() => {
    setZoom(zoom + step);
  }, [zoom, step, setZoom]);

  const zoomOut = useCallback(() => {
    setZoom(zoom - step);
  }, [zoom, step, setZoom]);

  const resetZoom = useCallback(() => {
    setZoom(initialZoom);
  }, [initialZoom, setZoom]);

  const handleWheel = useCallback((e: WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -step : step;
      setZoom(zoom + delta);
    }
  }, [zoom, step, setZoom]);

  const handlePinch = useCallback((scale: unknown) => {
    const delta = scale - lastPinchScale.current;
    lastPinchScale.current = scale;
    setZoom(zoom + delta);
  }, [zoom, setZoom]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const wheelHandler = (e: WheelEvent) => handleWheel(e);
    container.addEventListener('wheel', wheelHandler, { passive: false });

    return () => {
      container.removeEventListener('wheel', wheelHandler);
    };
  }, [handleWheel]);

  const isMinZoom = zoom <= minZoom;
  const isMaxZoom = zoom >= maxZoom;
  const zoomPercentage = `${Math.round(zoom * 100)}%`;

  return {
    zoom,
    zoomIn,
    zoomOut,
    resetZoom,
    setZoom,
    isMinZoom,
    isMaxZoom,
    zoomPercentage,
    containerRef,
    handleWheel,
    handlePinch,
  };
}

export default useZoom;
