export interface KPI {
  id: string;
  name: string;
  value: number;
  target: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  trendValue: number;
  period: string;
}

export interface KPIDashboard {
  kpis: KPI[];
  updatedAt: string;
}