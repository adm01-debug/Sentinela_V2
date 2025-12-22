import { api } from './client';

export const activitiesApi = {
  list: (params?: any) => api.get('/activities', { params }),
  get: (id: string) => api.get(`/activities/${id}`),
  timeline: (employeeId: string, date: string) => api.get(`/activities/timeline/${employeeId}`, { params: { date } }),
  summary: (params?: any) => api.get('/activities/summary', { params }),
  export: (params?: any) => api.get('/activities/export', { params, responseType: 'blob' }),
};
