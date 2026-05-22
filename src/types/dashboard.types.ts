export interface DashboardStats {
  totalEmployees: number;
  activeDevices: number;
  alertsCount: number;
  violationsCount: number;
  uptime: number;
  lastUpdated: string;
}

export interface DashboardLayout {
  id: string;
  name: string;
  widgets: any[];
  isDefault: boolean;
}

export interface DashboardFilter {
  dateRange?: [Date, Date];
  teams?: string[];
  employees?: string[];
}

export interface ChartDataPoint {
  label: string;
  value: number;
  timestamp?: string;
}

export interface ActivityStats {
  category: string;
  percentage: number;
  duration: number;
}
