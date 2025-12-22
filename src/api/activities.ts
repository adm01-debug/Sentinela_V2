import { api } from './client';

export const activitiesApi = {
  list: (params?: Record<string, unknown>) => api.get('/activities', { params }),
  get: (id: string) => api.get(`/activities/${id}`),
  timeline: (employeeId: string, date: string) => api.get(`/activities/timeline/${employeeId}/${date}`),
  stats: (params?: Record<string, unknown>) => api.get('/activities/stats', { params }),
};