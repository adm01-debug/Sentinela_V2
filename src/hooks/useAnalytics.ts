import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { trackEvent, trackPageView } from './google-analytics';

export function useAnalytics(params?: { period?: string }) {
  const track = useCallback((event: string, p?: Record<string, any>) => {
    trackEvent(event, p);
  }, []);
  
  const pageView = useCallback((path: string) => {
    trackPageView(path);
  }, []);

  const query = useQuery({
    queryKey: ['analytics', params],
    queryFn: async () => ({
      productivity: 78,
      activeHours: 6.5,
      activeUsers: 42,
      appsUsed: 15,
      chartData: [] as any[],
    }),
    enabled: !!params,
  });
  
  if (params) {
    return { ...query, track, pageView };
  }
  
  return { track, pageView, data: undefined };
}

export function useApplicationAnalytics() {
  return useQuery({
    queryKey: ['analytics-applications'],
    queryFn: async () => ({
      byCategory: [] as any[],
      topApps: [] as any[],
      byHour: [] as any[],
    }),
  });
}

export function useProductivityAnalytics() {
  return useQuery({
    queryKey: ['analytics-productivity'],
    queryFn: async () => ({
      topPerformers: [] as any[],
      byDepartment: [] as any[],
      metrics: [] as any[],
    }),
  });
}

export function useTrendsAnalytics() {
  return useQuery({
    queryKey: ['analytics-trends'],
    queryFn: async () => ({
      insights: [] as any[],
      monthlyData: [] as any[],
      predictions: [] as any[],
    }),
  });
}
