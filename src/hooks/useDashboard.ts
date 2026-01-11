import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/services';

export const useDashboardStats = () => {
  return useQuery({ queryKey: ['dashboard-stats'], queryFn: () => dashboardService.getStats(), refetchInterval: 30000 });
};

export const useActivityChart = (period: 'day' | 'week' | 'month' = 'week') => {
  return useQuery({ queryKey: ['activity-chart', period], queryFn: () => dashboardService.getActivityChart(period) });
};

export const useProductivityChart = (period: 'day' | 'week' | 'month' = 'week') => {
  return useQuery({ queryKey: ['productivity-chart', period], queryFn: () => dashboardService.getProductivityChart(period) });
};

export const useTopEmployees = (limit: number = 5) => {
  return useQuery({ queryKey: ['top-employees', limit], queryFn: () => dashboardService.getTopEmployees(limit) });
};

export const useTopApplications = (limit: number = 10) => {
  return useQuery({ queryKey: ['top-applications', limit], queryFn: () => dashboardService.getTopApplications(limit) });
};