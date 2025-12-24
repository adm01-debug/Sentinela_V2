export interface ClickPoint { x: number; y: number; timestamp: Date; element?: string; }
export class ClickMap {
  private clicks: ClickPoint[] = [];
  record(x: number, y: number, element?: string): void { this.clicks.push({ x, y, timestamp: new Date(), element }); }
  getClicks(): ClickPoint[] { return [...this.clicks]; }
  getHotspots(gridSize = 50): { x: number; y: number; count: number }[] { const grid = new Map<string, number>(); this.clicks.forEach(c => { const key = Math.floor(c.x / gridSize) + ',' + Math.floor(c.y / gridSize); grid.set(key, (grid.get(key) || 0) + 1); }); return Array.from(grid.entries()).map(([key, count]) => { const [x, y] = key.split(',').map(Number); return { x: x * gridSize, y: y * gridSize, count }; }); }
  clear(): void { this.clicks = []; }
}
export const clickMap = new ClickMap();
