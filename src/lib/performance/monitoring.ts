// Performance monitoring utilities
export const webVitals = {
  getCLS: () => new Promise(resolve => new PerformanceObserver(l => l.getEntries().forEach(e => resolve(e))).observe({ entryTypes: ['layout-shift'] })),
  getLCP: () => new Promise(resolve => new PerformanceObserver(l => l.getEntries().forEach(e => resolve(e))).observe({ entryTypes: ['largest-contentful-paint'] })),
  getFID: () => new Promise(resolve => new PerformanceObserver(l => l.getEntries().forEach(e => resolve(e))).observe({ entryTypes: ['first-input'] })),
};

export const performanceMarks = {
  start: (name: string) => performance.mark(`${name}_start`),
  end: (name: string) => { performance.mark(`${name}_end`); performance.measure(name, `${name}_start`, `${name}_end`); },
  getMeasure: (name: string) => performance.getEntriesByName(name, 'measure')[0],
};

export const reportMetrics = (metrics: Record<string, number>) => {
  console.log('Performance metrics:', metrics);
  // Send to analytics service
};

export const bundleSizeCheck = (maxSize: number) => {
  const entries = performance.getEntriesByType('resource');
  const jsSize = entries.filter(e => e.name.endsWith('.js')).reduce((acc, e) => acc + (e as any).transferSize, 0);
  return jsSize <= maxSize;
};
