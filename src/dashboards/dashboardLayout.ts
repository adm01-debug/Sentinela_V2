export interface LayoutItem { id: string; x: number; y: number; w: number; h: number; }
export class DashboardLayout {
  private items: LayoutItem[] = [];
  private cols = 12;
  setCols(cols: number): void { this.cols = cols; }
  add(id: string, x: number, y: number, w: number, h: number): void { this.items.push({ id, x, y, w, h }); }
  move(id: string, x: number, y: number): void { const item = this.items.find(i => i.id === id); if (item) { item.x = x; item.y = y; } }
  resize(id: string, w: number, h: number): void { const item = this.items.find(i => i.id === id); if (item) { item.w = w; item.h = h; } }
  remove(id: string): void { const idx = this.items.findIndex(i => i.id === id); if (idx >= 0) this.items.splice(idx, 1); }
  getLayout(): LayoutItem[] { return [...this.items]; }
  export(): string { return JSON.stringify(this.items); }
}
export const createLayout = () => new DashboardLayout();
