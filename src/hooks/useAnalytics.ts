import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { trackEvent, trackPageView } from './google-analytics';
import { analyticsService } from '@/services/analyticsService';

interface ChartDataPoint {
  label: string;
  value: number;
}

interface AppCategory {
  category: string;
  count: number;
  duration: number;
}

interface Performer {
  id: string;
  name: string;
  score: number;
}

interface TrendInsight {
  id: string;
  title: string;
  value: number;
  change: number;
  trend?: 'up' | 'down';
  description?: string;
}

interface MonthlyTrendData {
  label: string;
  productivity: number;
  activeHours: number;
}

interface TrendPrediction {
  metric: string;
  current: number;
  predicted: number;
  change: number;
}

export function useAnalytics(params?: { period?: string }) {
  const track = useCallback((event: string, p?: Record<string, string | number | boolean>) => {
    trackEvent(event, p);
  }, []);

  const pageView = useCallback((path: string) => {
    trackPageView(path);
  }, []);

  const query = useQuery({
    queryKey: ['analytics', params],
    queryFn: () => analyticsService.getDashboardMetrics(params),
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
    queryFn: () => analyticsService.getApplicationAnalytics(),
  });
}

export function useProductivityAnalytics() {
  return useQuery({
    queryKey: ['analytics-productivity'],
    queryFn: () => analyticsService.getProductivityAnalytics(),
  });
}

export function useTrendsAnalytics() {
  return useQuery({
    queryKey: ['analytics-trends'],
    queryFn: () => analyticsService.getTrendsAnalytics(),
  });
}
