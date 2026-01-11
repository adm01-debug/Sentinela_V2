import { apiClient } from '@/lib/api';

interface DashboardStats {
  totalEmployees: number;
  activeEmployees: number;
  averageProductivity: number;
  totalHours: number;
  alertsCount: number;
  productivityTrend: number;
}

interface Widget {
  id: string;
  type: string;
  title: string;
  config: Record<string, unknown>;
}

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    return apiClient.get('/dashboard/stats');
  },
  async getActivityChart(period: 'day' | 'week' | 'month'): Promise<Array<{ date: string; value: number }>> {
    return apiClient.get('/dashboard/activity-chart', { period });
  },
  async getProductivityChart(period: 'day' | 'week' | 'month'): Promise<Array<{ date: string; value: number }>> {
    return apiClient.get('/dashboard/productivity-chart', { period });
  },
  async getTopEmployees(limit: number = 5): Promise<Array<{ employee: string; productivity: number }>> {
    return apiClient.get('/dashboard/top-employees', { limit: String(limit) });
  },
  async getTopApplications(limit: number = 10): Promise<Array<{ app: string; duration: number }>> {
    return apiClient.get('/dashboard/top-applications', { limit: String(limit) });
  },
  async getWidgets(): Promise<Widget[]> {
    return apiClient.get('/dashboard/widgets');
  },
  async saveWidgets(widgets: Widget[]): Promise<void> {
    return apiClient.put('/dashboard/widgets', { widgets });
  }
};