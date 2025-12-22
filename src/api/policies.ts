import { api } from './client';

export const policiesApi = {
  list: (params?: Record<string, unknown>) => api.get('/policies', { params }),
  get: (id: string) => api.get(`/policies/${id}`),
  create: (data: Record<string, unknown>) => api.post('/policies', data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/policies/${id}`, data),
  delete: (id: string) => api.delete(`/policies/${id}`),
};