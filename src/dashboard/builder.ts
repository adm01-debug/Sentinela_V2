/**
 * @fileoverview Dashboard Builder
 * @module @sentinela/core/dashboard
 */
export interface Panel { title: string; type: string; query?: string; }
export interface Dashboard { id: string; title: string; panels: Panel[]; }
export class DashboardBuilder {
  private panels: Panel[] = [];
  private title = 'Dashboard';
  setTitle(t: string): this { this.title = t; return this; }
  addPanel(p: Panel): this { this.panels.push(p); return this; }
  build(): Dashboard { return { id: 'dash_' + Date.now(), title: this.title, panels: this.panels }; }
}
