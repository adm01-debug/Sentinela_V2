export interface DashboardStats {
  employees: {
    total: number;
    active: number;
    idle: number;
    offline: number;
  };
  violations: {
    total: number;
    today: number;
    pending: number;
    resolved: number;
  };
  productivity: {
    average: number;
    trend: 'up' | 'down' | 'stable';
    topPerformers: string[];
  };
  activity: {
    keystrokes: number;
    clicks: number;
    activeTime: number;
  };
}

export interface DashboardWidget {
  id: string;
  type: 'chart' | 'stat' | 'table' | 'map';
  title: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  config: Record<string, unknown>;
}

export interface DashboardLayout {
  id: string;
  name: string;
  widgets: DashboardWidget[];
  isDefault: boolean;
}
