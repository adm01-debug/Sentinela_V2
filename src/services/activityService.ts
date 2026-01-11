import { apiClient } from '@/lib/api';
import type { Activity, ActivitySummary, ActivityFilters, PaginatedResponse } from '@/types';

export const activityService = {
  async list(filters: ActivityFilters): Promise<PaginatedResponse<Activity>> {
    return apiClient.get('/activities', filters as unknown as Record<string, string>);
  },
  async get(id: string): Promise<Activity> {
    return apiClient.get('/activities/' + id);
  },
  async getSummary(filters: ActivityFilters): Promise<ActivitySummary> {
    return apiClient.get('/activities/summary', filters as unknown as Record<string, string>);
  },
  async batchCreate(activities: Omit<Activity, 'id'>[]): Promise<Activity[]> {
    return apiClient.post('/activities/batch', { activities });
  },
  async getTimeline(employeeId: string, date: string): Promise<Activity[]> {
    return apiClient.get('/activities/timeline', { employeeId, date });
  },
  async getTopApplications(filters: ActivityFilters): Promise<Array<{ app: string; duration: number }>> {
    return apiClient.get('/activities/top-applications', filters as unknown as Record<string, string>);
  },
  async getProductivityScore(employeeId: string, startDate: string, endDate: string): Promise<number> {
    const response = await apiClient.get('/activities/productivity', { employeeId, startDate, endDate });
    return (response as { score: number }).score;
  }
};