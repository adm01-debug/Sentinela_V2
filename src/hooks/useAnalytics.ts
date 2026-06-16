import { useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { trackEvent, trackPageView } from "./google-analytics";
import { analyticsService } from "@/services/analyticsService";

export function useAnalytics(params?: { period?: string }) {
  const track = useCallback((event: string, p?: Record<string, string | number | boolean>) => {
    trackEvent(event, p);
  }, []);

  const pageView = useCallback((path: string) => {
    trackPageView(path);
  }, []);

  const query = useQuery({
    queryKey: ["analytics", params],
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
    queryKey: ["analytics-applications"],
    queryFn: () => analyticsService.getApplicationAnalytics(),
  });
}

export function useProductivityAnalytics() {
  return useQuery({
    queryKey: ["analytics-productivity"],
    queryFn: () => analyticsService.getProductivityAnalytics(),
  });
}

export function useTrendsAnalytics() {
  return useQuery({
    queryKey: ["analytics-trends"],
    queryFn: () => analyticsService.getTrendsAnalytics(),
  });
}
