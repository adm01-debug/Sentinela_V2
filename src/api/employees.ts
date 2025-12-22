import { api } from './client';

export const employeesApi = {
  list: (params?: Record<string, unknown>) => api.get('/employees', { params }),
  get: (id: string) => api.get(`/employees/${id}`),
  create: (data: Record<string, unknown>) => api.post('/employees', data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/employees/${id}`, data),
  delete: (id: string) => api.delete(`/employees/${id}`),
  activities: (id: string, params?: Record<string, unknown>) => api.get(`/employees/${id}/activities`, { params }),
};