import { api } from './client';

export const screenshotsApi = {
  list: (params?: Record<string, unknown>) => api.get('/screenshots', { params }),
  get: (id: string) => api.get(`/screenshots/${id}`),
  delete: (id: string) => api.delete(`/screenshots/${id}`),
  blur: (id: string) => api.post(`/screenshots/${id}/blur`),
};