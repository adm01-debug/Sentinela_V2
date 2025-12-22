import { api } from './client';

export const geofencesApi = {
  list: (params?: Record<string, unknown>) => api.get('/geofences', { params }),
  get: (id: string) => api.get(`/geofences/${id}`),
  create: (data: Record<string, unknown>) => api.post('/geofences', data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/geofences/${id}`, data),
  delete: (id: string) => api.delete(`/geofences/${id}`),
};