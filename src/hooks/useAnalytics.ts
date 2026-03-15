import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { trackEvent, trackPageView } from './google-analytics';

interface ChartDataPoint { label: string; value: number; }
interface AppCategory { category: string; count: number; duration: number; }
interface Performer { id: string; name: string; score: number; }
interface TrendInsight { id: string; title: string; value: number; change: number; }

export function useAnalytics(params?: { period?: string }) {
  const track = useCallback((event: string, p?: Record<string, string | number | boolean>) => {
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
      chartData: [] as ChartDataPoint[],
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
      byCategory: [] as AppCategory[],
      topApps: [] as AppCategory[],
      byHour: [] as ChartDataPoint[],
    }),
  });
}

export function useProductivityAnalytics() {
  return useQuery({
    queryKey: ['analytics-productivity'],
    queryFn: async () => ({
      topPerformers: [] as Performer[],
      byDepartment: [] as ChartDataPoint[],
      metrics: [] as ChartDataPoint[],
    }),
  });
}

export function useTrendsAnalytics() {
  return useQuery({
    queryKey: ['analytics-trends'],
    queryFn: async () => ({
      insights: [] as TrendInsight[],
      monthlyData: [] as ChartDataPoint[],
      predictions: [] as ChartDataPoint[],
    }),
  });
}
