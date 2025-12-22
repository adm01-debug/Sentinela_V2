import { api } from './client';

export const teamsApi = {
  list: (params?: Record<string, unknown>) => api.get('/teams', { params }),
  get: (id: string) => api.get(`/teams/${id}`),
  create: (data: Record<string, unknown>) => api.post('/teams', data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/teams/${id}`, data),
  delete: (id: string) => api.delete(`/teams/${id}`),
  members: (id: string) => api.get(`/teams/${id}/members`),
};