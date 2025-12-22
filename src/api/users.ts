import { api } from './client';

export const usersApi = {
  list: (params?: { page?: number; limit?: number }) => api.get('/users', { params }),
  get: (id: string) => api.get(`/users/${id}`),
  create: (data: any) => api.post('/users', data),
  update: (id: string, data: any) => api.patch(`/users/${id}`, data),
  delete: (id: string) => api.delete(`/users/${id}`),
  me: () => api.get('/users/me'),
  updateMe: (data: any) => api.patch('/users/me', data),
};
