import { api } from './client';

export const notificationsApi = {
  list: (params?: Record<string, unknown>) => api.get('/notifications', { params }),
  markRead: (id: string) => api.post(`/notifications/${id}/read`),
  markAllRead: () => api.post('/notifications/read-all'),
  settings: () => api.get('/notifications/settings'),
  updateSettings: (data: Record<string, unknown>) => api.put('/notifications/settings', data),
};