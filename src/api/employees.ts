import { api } from './client';

export const employeesApi = {
  list: (params?: any) => api.get('/employees', { params }),
  get: (id: string) => api.get(`/employees/${id}`),
  create: (data: any) => api.post('/employees', data),
  update: (id: string, data: any) => api.patch(`/employees/${id}`, data),
  delete: (id: string) => api.delete(`/employees/${id}`),
  activities: (id: string, params?: any) => api.get(`/employees/${id}/activities`, { params }),
  screenshots: (id: string, params?: any) => api.get(`/employees/${id}/screenshots`, { params }),
};
