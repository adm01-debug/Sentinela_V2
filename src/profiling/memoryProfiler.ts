export interface MemorySnapshot { timestamp: number; usedJSHeapSize: number; totalJSHeapSize: number; jsHeapSizeLimit: number; }
export class MemoryProfiler {
  private snapshots: MemorySnapshot[] = [];
  capture(): MemorySnapshot | null { if ('memory' in performance) { const mem = (performance as any).memory; const snapshot: MemorySnapshot = { timestamp: Date.now(), usedJSHeapSize: mem.usedJSHeapSize, totalJSHeapSize: mem.totalJSHeapSize, jsHeapSizeLimit: mem.jsHeapSizeLimit }; this.snapshots.push(snapshot); return snapshot; } return null; }
  getSnapshots(): MemorySnapshot[] { return [...this.snapshots]; }
  getLeakIndicators(): { growing: boolean; rate: number } { if (this.snapshots.length < 2) return { growing: false, rate: 0 }; const first = this.snapshots[0]; const last = this.snapshots[this.snapshots.length - 1]; const rate = (last.usedJSHeapSize - first.usedJSHeapSize) / (last.timestamp - first.timestamp); return { growing: rate > 0, rate }; }
  clear(): void { this.snapshots = []; }
}
export const memoryProfiler = new MemoryProfiler();
