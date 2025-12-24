export interface Dashboard { id: string; name: string; description?: string; widgets: string[]; layout: 'grid' | 'freeform'; refreshInterval: number; }
export class DashboardBuilder {
  private dashboard: Partial<Dashboard> = { widgets: [], layout: 'grid', refreshInterval: 60000 };
  setName(name: string): this { this.dashboard.name = name; return this; }
  setDescription(description: string): this { this.dashboard.description = description; return this; }
  setLayout(layout: 'grid' | 'freeform'): this { this.dashboard.layout = layout; return this; }
  setRefreshInterval(ms: number): this { this.dashboard.refreshInterval = ms; return this; }
  addWidget(widgetId: string): this { this.dashboard.widgets!.push(widgetId); return this; }
  build(): Dashboard { return { id: crypto.randomUUID(), ...this.dashboard } as Dashboard; }
}
export const createDashboard = () => new DashboardBuilder();
