export function trackTiming(category: string, variable: string, value: number) {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'timing_complete', { name: variable, value, event_category: category });
  }
}

export function measurePerformance(name: string, fn: () => void) {
  const start = performance.now();
  fn();
  const duration = performance.now() - start;
  trackTiming('performance', name, Math.round(duration));
}
