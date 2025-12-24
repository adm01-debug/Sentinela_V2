import { Dashboard, Panel } from './types';

export class DashboardRenderer {
  render(dashboard: Dashboard): RenderedDashboard {
    return {
      id: dashboard.id,
      name: dashboard.name,
      panels: dashboard.rows.flatMap(row => row.panels.map(p => this.renderPanel(p))),
      layout: this.calculateLayout(dashboard)
    };
  }
  
  private renderPanel(panel: Panel): RenderedPanel {
    return { id: panel.id, type: panel.type, title: panel.title, position: panel.gridPos, data: null };
  }
  
  private calculateLayout(dashboard: Dashboard): LayoutInfo {
    const totalPanels = dashboard.rows.reduce((sum, row) => sum + row.panels.length, 0);
    return { columns: 12, rows: dashboard.rows.length, totalPanels };
  }
}

export interface RenderedDashboard { id: string; name: string; panels: RenderedPanel[]; layout: LayoutInfo; }
export interface RenderedPanel { id: string; type: string; title: string; position: Panel['gridPos']; data: unknown; }
export interface LayoutInfo { columns: number; rows: number; totalPanels: number; }