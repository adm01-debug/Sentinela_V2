import { useEffect, useRef, useCallback } from 'react';

// Performance monitoring hook
export function usePerformanceMonitor(componentName: string) {
  const renderCount = useRef(0);
  const lastRenderTime = useRef(performance.now());

  useEffect(() => {
    renderCount.current++;
    const now = performance.now();
    const timeSinceLastRender = now - lastRenderTime.current;
    lastRenderTime.current = now;

    if (process.env.NODE_ENV === 'development') {
      console.debug(`[Perf] ${componentName}: render #${renderCount.current}, interval: ${timeSinceLastRender.toFixed(2)}ms`);
    }
  });

  return { renderCount: renderCount.current };
}

// Measure async operation
export async function measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
  const start = performance.now();
  try {
    return await fn();
  } finally {
    const duration = performance.now() - start;
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[Perf] ${name}: ${duration.toFixed(2)}ms`);
    }
    if (typeof window !== 'undefined' && 'performance' in window) {
      performance.measure(name, { start, duration });
    }
  }
}

// Request idle callback wrapper
export function requestIdleCallback(callback: IdleRequestCallback, options?: IdleRequestOptions): number {
  if ('requestIdleCallback' in window) {
    return window.requestIdleCallback(callback, options);
  }
  return window.setTimeout(() => callback({ didTimeout: false, timeRemaining: () => 50 }), 1) as unknown as number;
}

// Batch DOM updates
export function batchDOMUpdates(updates: (() => void)[]): void {
  requestAnimationFrame(() => {
    updates.forEach(update => update());
  });
}

// Intersection observer hook for lazy loading
export function useIntersectionObserver(
  callback: (entry: IntersectionObserverEntry) => void,
  options?: IntersectionObserverInit
) {
  const targetRef = useRef<HTMLElement | null>(null);

  const setTarget = useCallback((element: HTMLElement | null) => {
    targetRef.current = element;
  }, []);

  useEffect(() => {
    if (!targetRef.current) return;

    const observer = new IntersectionObserver(([entry]) => {
      callback(entry);
    }, options);

    observer.observe(targetRef.current);
    return () => observer.disconnect();
  }, [callback, options]);

  return setTarget;
}
