export class PerformanceMonitor {
  private marks = new Map<string, number>();
  start(label: string): void { this.marks.set(label, performance.now()); }
  end(label: string): number { const start = this.marks.get(label); if (!start) return 0; const duration = performance.now() - start; this.marks.delete(label); return duration; }
  measure<T>(label: string, fn: () => T): T { this.start(label); const result = fn(); console.log(label + ':', this.end(label).toFixed(2) + 'ms'); return result; }
  async measureAsync<T>(label: string, fn: () => Promise<T>): Promise<T> { this.start(label); const result = await fn(); console.log(label + ':', this.end(label).toFixed(2) + 'ms'); return result; }
  getNavigationTiming(): PerformanceNavigationTiming | null { const entries = performance.getEntriesByType('navigation'); return entries[0] as PerformanceNavigationTiming || null; }
}
export const performanceMonitor = new PerformanceMonitor();
