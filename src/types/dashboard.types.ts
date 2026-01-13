export interface DashboardWidget { id: string; type: WidgetType; title: string; config: WidgetConfig; position: WidgetPosition; }
export type WidgetType = 'stat' | 'chart' | 'list' | 'table' | 'map' | 'calendar' | 'activity' | 'alerts';
export interface WidgetConfig { dataSource?: string; refreshInterval?: number; filters?: Record<string, any>; chartType?: string; columns?: string[]; }
export interface WidgetPosition { x: number; y: number; width: number; height: number; }
export interface DashboardLayout { id: string; name: string; widgets: DashboardWidget[]; isDefault?: boolean; createdAt: string; updatedAt: string; }
export interface DashboardStats { totalEmployees: number; activeNow: number; productivity: number; violations: number; alerts: number; }
export interface DashboardFilter { dateRange: { start: string; end: string }; teams?: string[]; departments?: string[]; employees?: string[]; }
