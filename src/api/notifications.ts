import { api } from './client';

export const notificationsApi = {
  list: (params?: any) => api.get('/notifications', { params }),
  get: (id: string) => api.get(`/notifications/${id}`),
  markAsRead: (id: string) => api.post(`/notifications/${id}/read`),
  markAllAsRead: () => api.post('/notifications/read-all'),
  delete: (id: string) => api.delete(`/notifications/${id}`),
  settings: () => api.get('/notifications/settings'),
  updateSettings: (data: any) => api.patch('/notifications/settings', data),
};
