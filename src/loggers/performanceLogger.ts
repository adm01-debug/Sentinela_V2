interface PerfEntry { name: string; startTime: number; endTime?: number; duration?: number; }
class PerformanceLogger {
  private entries: Map<string, PerfEntry> = new Map();
  start(name: string) { this.entries.set(name, { name, startTime: performance.now() }); }
  end(name: string) { const entry = this.entries.get(name); if (entry) { entry.endTime = performance.now(); entry.duration = entry.endTime - entry.startTime; console.log('[Perf]', name + ':', entry.duration.toFixed(2) + 'ms'); } }
  measure(name: string, fn: () => any) { this.start(name); const result = fn(); this.end(name); return result; }
  async measureAsync(name: string, fn: () => Promise<any>) { this.start(name); const result = await fn(); this.end(name); return result; }
  getMetrics(): PerfEntry[] { return Array.from(this.entries.values()).filter(e => e.duration !== undefined); }
}
export const performanceLogger = new PerformanceLogger();
