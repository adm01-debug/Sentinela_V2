import { api } from './client';

export const reportsApi = {
  list: (params?: any) => api.get('/reports', { params }),
  get: (id: string) => api.get(`/reports/${id}`),
  create: (data: any) => api.post('/reports', data),
  generate: (type: string, params: any) => api.post('/reports/generate', { type, ...params }),
  download: (id: string, format: string) => api.get(`/reports/${id}/download`, { params: { format }, responseType: 'blob' }),
  schedule: (data: any) => api.post('/reports/schedule', data),
};
