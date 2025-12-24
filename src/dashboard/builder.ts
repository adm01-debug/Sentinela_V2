import { Dashboard, DashboardRow, Panel, Variable } from './types';
import { v4 as uuidv4 } from 'uuid';

export class DashboardBuilder {
  private dashboard: Dashboard = { id: uuidv4(), name: '', rows: [], variables: [], refreshInterval: 30 };
  
  name(name: string): this { this.dashboard.name = name; return this; }
  refreshInterval(seconds: number): this { this.dashboard.refreshInterval = seconds; return this; }
  
  addRow(height: number, panels: Panel[]): this {
    this.dashboard.rows.push({ height, panels });
    return this;
  }
  
  addVariable(variable: Variable): this {
    this.dashboard.variables.push(variable);
    return this;
  }
  
  build(): Dashboard { return { ...this.dashboard }; }
}

export class PanelBuilder {
  private panel: Partial<Panel> = { config: {} };
  
  id(id: string): this { this.panel.id = id; return this; }
  type(type: Panel['type']): this { this.panel.type = type; return this; }
  title(title: string): this { this.panel.title = title; return this; }
  gridPos(pos: Panel['gridPos']): this { this.panel.gridPos = pos; return this; }
  config(key: string, value: unknown): this { this.panel.config![key] = value; return this; }
  
  build(): Panel { return { id: uuidv4(), ...this.panel } as Panel; }
}