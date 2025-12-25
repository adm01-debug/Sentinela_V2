/**
 * @fileoverview Dashboard types
 * @module @sentinela/core/dashboard
 * @version 13.0.0
 */

export interface Dashboard { id: string; name: string; rows: DashboardRow[]; variables: Variable[]; refreshInterval: number; }
export interface DashboardRow { height: number; panels: Panel[]; }
export interface Panel { id: string; type: PanelType; title: string; gridPos: GridPos; config: Record<string, unknown>; }
export type PanelType = 'graph' | 'stat' | 'table' | 'gauge' | 'text' | 'alert';
export interface GridPos { x: number; y: number; w: number; h: number; }
export interface Variable { name: string; type: 'query' | 'constant' | 'custom'; value: string; }