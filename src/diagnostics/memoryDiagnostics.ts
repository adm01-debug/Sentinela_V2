export interface MemoryDiagnostics { usedJSHeapSize: number; totalJSHeapSize: number; jsHeapSizeLimit: number; usagePercentage: number; }
export function getMemoryDiagnostics(): MemoryDiagnostics | null {
  const memory = (performance as any).memory;
  if (!memory) return null;
  return { usedJSHeapSize: memory.usedJSHeapSize, totalJSHeapSize: memory.totalJSHeapSize, jsHeapSizeLimit: memory.jsHeapSizeLimit, usagePercentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100 };
}
