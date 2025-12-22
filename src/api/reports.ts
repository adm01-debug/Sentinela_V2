import { api } from './client';

export const reportsApi = {
  list: (params?: Record<string, unknown>) => api.get('/reports', { params }),
  generate: (data: Record<string, unknown>) => api.post('/reports/generate', data),
  download: (id: string, format: string) => api.get(`/reports/${id}/download`, { params: { format } }),
  schedule: (data: Record<string, unknown>) => api.post('/reports/schedule', data),
};