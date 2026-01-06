import { useState, useEffect, useCallback, useRef } from 'react';

export interface PerformanceMetrics {
  fps: number;
  memory?: number;
  loadTime: number;
  domNodes: number;
  resourceCount: number;
}

export interface UsePerformanceMonitorOptions {
  sampleInterval?: number;
  onThresholdExceeded?: (metric: string, value: number) => void;
  thresholds?: {
    minFps?: number;
    maxMemory?: number;
    maxLoadTime?: number;
  };
}

export function usePerformanceMonitor(options: UsePerformanceMonitorOptions = {}) {
  const { sampleInterval = 1000, onThresholdExceeded, thresholds = {} } = options;
  const { minFps = 30, maxMemory = 100, maxLoadTime = 3000 } = thresholds;
  
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    memory: undefined,
    loadTime: 0,
    domNodes: 0,
    resourceCount: 0,
  });
  
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());

  useEffect(() => {
    // FPS counter
    let animationId: number;
    const countFrame = () => {
      frameCount.current++;
      animationId = requestAnimationFrame(countFrame);
    };
    animationId = requestAnimationFrame(countFrame);

    // Sample metrics
    const interval = setInterval(() => {
      const now = performance.now();
      const elapsed = now - lastTime.current;
      const fps = Math.round((frameCount.current / elapsed) * 1000);
      
      frameCount.current = 0;
      lastTime.current = now;

      // Get memory if available
      const memory = (performance as any).memory?.usedJSHeapSize 
        ? Math.round((performance as any).memory.usedJSHeapSize / 1048576) 
        : undefined;

      // Get DOM metrics
      const domNodes = document.getElementsByTagName('*').length;
      const resourceCount = performance.getEntriesByType('resource').length;

      // Get load time
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const loadTime = navigation ? Math.round(navigation.loadEventEnd - navigation.startTime) : 0;

      const newMetrics = { fps, memory, loadTime, domNodes, resourceCount };
      setMetrics(newMetrics);

      // Check thresholds
      if (fps < minFps) onThresholdExceeded?.('fps', fps);
      if (memory && memory > maxMemory) onThresholdExceeded?.('memory', memory);
      if (loadTime > maxLoadTime) onThresholdExceeded?.('loadTime', loadTime);
    }, sampleInterval);

    return () => {
      cancelAnimationFrame(animationId);
      clearInterval(interval);
    };
  }, [sampleInterval, minFps, maxMemory, maxLoadTime, onThresholdExceeded]);

  const getPerformanceReport = useCallback(() => ({
    ...metrics,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href,
  }), [metrics]);

  return { metrics, getPerformanceReport };
}

export default usePerformanceMonitor;
