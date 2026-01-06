import { useState, useCallback, useMemo } from 'react';

export interface ZoomState {
  scaleX: number;
  scaleY: number;
  translateX: number;
  translateY: number;
}

export interface UseChartZoomOptions {
  minScale?: number;
  maxScale?: number;
  initialState?: Partial<ZoomState>;
}

export function useChartZoom(options: UseChartZoomOptions = {}) {
  const { minScale = 0.5, maxScale = 10, initialState = {} } = options;
  const [zoomState, setZoomState] = useState<ZoomState>({
    scaleX: 1, scaleY: 1, translateX: 0, translateY: 0, ...initialState
  });

  const zoomIn = useCallback((factor = 1.2) => {
    setZoomState(prev => ({
      ...prev,
      scaleX: Math.min(maxScale, prev.scaleX * factor),
      scaleY: Math.min(maxScale, prev.scaleY * factor),
    }));
  }, [maxScale]);

  const zoomOut = useCallback((factor = 1.2) => {
    setZoomState(prev => ({
      ...prev,
      scaleX: Math.max(minScale, prev.scaleX / factor),
      scaleY: Math.max(minScale, prev.scaleY / factor),
    }));
  }, [minScale]);

  const pan = useCallback((deltaX: number, deltaY: number) => {
    setZoomState(prev => ({ ...prev, translateX: prev.translateX + deltaX, translateY: prev.translateY + deltaY }));
  }, []);

  const reset = useCallback(() => {
    setZoomState({ scaleX: 1, scaleY: 1, translateX: 0, translateY: 0 });
  }, []);

  const zoomToFit = useCallback((containerWidth: number, containerHeight: number, contentWidth: number, contentHeight: number) => {
    const scaleX = containerWidth / contentWidth;
    const scaleY = containerHeight / contentHeight;
    const scale = Math.min(scaleX, scaleY, maxScale);
    setZoomState({ scaleX: scale, scaleY: scale, translateX: 0, translateY: 0 });
  }, [maxScale]);

  const transform = useMemo(() => 
    `translate(${zoomState.translateX}px, ${zoomState.translateY}px) scale(${zoomState.scaleX}, ${zoomState.scaleY})`,
    [zoomState]
  );

  return { zoomState, zoomIn, zoomOut, pan, reset, zoomToFit, transform, isZoomed: zoomState.scaleX !== 1 || zoomState.scaleY !== 1 };
}

export default useChartZoom;
