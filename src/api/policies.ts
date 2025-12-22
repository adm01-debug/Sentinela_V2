import { api } from './client';

export const policiesApi = {
  list: (params?: any) => api.get('/policies', { params }),
  get: (id: string) => api.get(`/policies/${id}`),
  create: (data: any) => api.post('/policies', data),
  update: (id: string, data: any) => api.patch(`/policies/${id}`, data),
  delete: (id: string) => api.delete(`/policies/${id}`),
  activate: (id: string) => api.post(`/policies/${id}/activate`),
  deactivate: (id: string) => api.post(`/policies/${id}/deactivate`),
};
