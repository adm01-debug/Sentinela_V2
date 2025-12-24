export type WidgetType = 'chart' | 'table' | 'metric' | 'text' | 'heatmap';
export interface Widget { id: string; type: WidgetType; title: string; config: any; position: { x: number; y: number; w: number; h: number }; }
export class WidgetManager {
  private widgets = new Map<string, Widget>();
  create(type: WidgetType, title: string, config: any): Widget { const widget: Widget = { id: crypto.randomUUID(), type, title, config, position: { x: 0, y: 0, w: 4, h: 3 } }; this.widgets.set(widget.id, widget); return widget; }
  get(id: string): Widget | undefined { return this.widgets.get(id); }
  update(id: string, updates: Partial<Widget>): void { const widget = this.widgets.get(id); if (widget) Object.assign(widget, updates); }
  delete(id: string): boolean { return this.widgets.delete(id); }
  list(): Widget[] { return Array.from(this.widgets.values()); }
}
export const widgetManager = new WidgetManager();
