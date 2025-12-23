export interface PerformanceDiagnostics { pageLoadTime: number; domContentLoaded: number; firstPaint: number; firstContentfulPaint: number; }
export function getPerformanceDiagnostics(): PerformanceDiagnostics {
  const timing = performance.timing;
  const paintEntries = performance.getEntriesByType('paint');
  const fp = paintEntries.find(e => e.name === 'first-paint')?.startTime || 0;
  const fcp = paintEntries.find(e => e.name === 'first-contentful-paint')?.startTime || 0;
  return { pageLoadTime: timing.loadEventEnd - timing.navigationStart, domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart, firstPaint: fp, firstContentfulPaint: fcp };
}
