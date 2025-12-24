export interface HoverPoint { x: number; y: number; duration: number; element?: string; }
export class HoverMap {
  private hovers: HoverPoint[] = [];
  private current: { x: number; y: number; start: number; element?: string } | null = null;
  startHover(x: number, y: number, element?: string): void { this.current = { x, y, start: Date.now(), element }; }
  endHover(): void { if (this.current) { const duration = Date.now() - this.current.start; this.hovers.push({ x: this.current.x, y: this.current.y, duration, element: this.current.element }); this.current = null; } }
  getHovers(): HoverPoint[] { return [...this.hovers]; }
  getAverageHoverTime(): number { if (!this.hovers.length) return 0; return this.hovers.reduce((sum, h) => sum + h.duration, 0) / this.hovers.length; }
  clear(): void { this.hovers = []; this.current = null; }
}
export const hoverMap = new HoverMap();
