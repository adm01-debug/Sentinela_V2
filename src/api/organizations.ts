import { api } from './client';

export const organizationsApi = {
  get: () => api.get('/organization'),
  update: (data: Record<string, unknown>) => api.put('/organization', data),
  settings: () => api.get('/organization/settings'),
  updateSettings: (data: Record<string, unknown>) => api.put('/organization/settings', data),
};