import { useQuery } from '@tanstack/react-query';
import { activityService } from '@/services';
import type { ActivityFilters } from '@/types';

export const useActivities = (filters: ActivityFilters) => {
  return useQuery({
    queryKey: ['activities', filters],
    queryFn: () => activityService.list(filters),
    enabled: !!filters.startDate && !!filters.endDate
  });
};

export const useActivitySummary = (filters: ActivityFilters) => {
  return useQuery({
    queryKey: ['activity-summary', filters],
    queryFn: () => activityService.getSummary(filters),
    enabled: !!filters.startDate && !!filters.endDate
  });
};

export const useActivityTimeline = (employeeId: string, date: string) => {
  return useQuery({
    queryKey: ['activity-timeline', employeeId, date],
    queryFn: () => activityService.getTimeline(employeeId, date),
    enabled: !!employeeId && !!date
  });
};

export const useTopApplications = (filters: ActivityFilters) => {
  return useQuery({
    queryKey: ['top-applications', filters],
    queryFn: () => activityService.getTopApplications(filters),
    enabled: !!filters.startDate && !!filters.endDate
  });
};

export const useProductivityScore = (employeeId: string, startDate: string, endDate: string) => {
  return useQuery({
    queryKey: ['productivity-score', employeeId, startDate, endDate],
    queryFn: () => activityService.getProductivityScore(employeeId, startDate, endDate),
    enabled: !!employeeId && !!startDate && !!endDate
  });
};