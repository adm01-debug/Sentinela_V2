export interface HeatmapConfig { width: number; height: number; radius: number; blur: number; maxOpacity: number; gradient?: Record<number, string>; }
export class HeatmapRenderer {
  private config: HeatmapConfig = { width: 800, height: 600, radius: 25, blur: 15, maxOpacity: 0.8, gradient: { 0.4: 'blue', 0.6: 'cyan', 0.7: 'lime', 0.8: 'yellow', 1.0: 'red' } };
  configure(config: Partial<HeatmapConfig>): void { this.config = { ...this.config, ...config }; }
  render(canvas: HTMLCanvasElement, points: { x: number; y: number; value: number }[]): void { const ctx = canvas.getContext('2d'); if (!ctx) return; canvas.width = this.config.width; canvas.height = this.config.height; points.forEach(p => { const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, this.config.radius); gradient.addColorStop(0, 'rgba(255,0,0,' + (p.value * this.config.maxOpacity) + ')'); gradient.addColorStop(1, 'rgba(255,0,0,0)'); ctx.fillStyle = gradient; ctx.fillRect(p.x - this.config.radius, p.y - this.config.radius, this.config.radius * 2, this.config.radius * 2); }); }
}
export const heatmapRenderer = new HeatmapRenderer();
