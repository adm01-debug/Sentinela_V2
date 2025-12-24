export class RenderOptimizer {
  private rafId: number | null = null;
  batchUpdates(updates: (() => void)[]): void { if (this.rafId) cancelAnimationFrame(this.rafId); this.rafId = requestAnimationFrame(() => { updates.forEach(u => u()); this.rafId = null; }); }
  shouldComponentUpdate(prevProps: any, nextProps: any): boolean { return JSON.stringify(prevProps) !== JSON.stringify(nextProps); }
  virtualScroll(items: any[], visibleCount: number, startIndex: number): any[] { return items.slice(startIndex, startIndex + visibleCount); }
}
export const renderOptimizer = new RenderOptimizer();
