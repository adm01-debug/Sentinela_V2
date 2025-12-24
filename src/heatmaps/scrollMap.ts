export interface ScrollData { maxDepth: number; timestamps: { depth: number; time: Date }[]; }
export class ScrollMap {
  private data: ScrollData = { maxDepth: 0, timestamps: [] };
  record(depth: number): void { if (depth > this.data.maxDepth) this.data.maxDepth = depth; this.data.timestamps.push({ depth, time: new Date() }); }
  getMaxDepth(): number { return this.data.maxDepth; }
  getScrollDepthPercent(pageHeight: number): number { return (this.data.maxDepth / pageHeight) * 100; }
  getTimeAtDepth(depth: number): number { const entries = this.data.timestamps.filter(t => t.depth >= depth); if (entries.length < 2) return 0; return entries[entries.length - 1].time.getTime() - entries[0].time.getTime(); }
  clear(): void { this.data = { maxDepth: 0, timestamps: [] }; }
}
export const scrollMap = new ScrollMap();
