import { api } from './client';

export const geofencesApi = {
  list: (params?: any) => api.get('/geofences', { params }),
  get: (id: string) => api.get(`/geofences/${id}`),
  create: (data: any) => api.post('/geofences', data),
  update: (id: string, data: any) => api.patch(`/geofences/${id}`, data),
  delete: (id: string) => api.delete(`/geofences/${id}`),
  events: (id: string, params?: any) => api.get(`/geofences/${id}/events`, { params }),
};
