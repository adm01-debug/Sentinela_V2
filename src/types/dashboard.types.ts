export interface DashboardStats {
  totalEmployees: number;
  activeDevices: number;
  alertsCount: number;
  violationsCount: number;
  uptime: number;
  lastUpdated: string;
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
