import { api } from './client';

export const teamsApi = {
  list: (params?: any) => api.get('/teams', { params }),
  get: (id: string) => api.get(`/teams/${id}`),
  create: (data: any) => api.post('/teams', data),
  update: (id: string, data: any) => api.patch(`/teams/${id}`, data),
  delete: (id: string) => api.delete(`/teams/${id}`),
  members: (id: string) => api.get(`/teams/${id}/members`),
  addMember: (id: string, userId: string) => api.post(`/teams/${id}/members`, { userId }),
  removeMember: (id: string, userId: string) => api.delete(`/teams/${id}/members/${userId}`),
};
