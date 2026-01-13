import { api } from '@/services/api';
export const service = {
  getAll: () => api.get('/endpoint'),
  getById: (id: string) => api.get(`/endpoint/${id}`),
  create: (data: any) => api.post('/endpoint', data),
  update: (id: string, data: any) => api.put(`/endpoint/${id}`, data),
  delete: (id: string) => api.delete(`/endpoint/${id}`),
};
