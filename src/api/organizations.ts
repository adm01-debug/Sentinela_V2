import { api } from './client';

export const organizationsApi = {
  get: () => api.get('/organization'),
  update: (data: any) => api.patch('/organization', data),
  settings: () => api.get('/organization/settings'),
  updateSettings: (data: any) => api.patch('/organization/settings', data),
  members: () => api.get('/organization/members'),
  invite: (email: string, role: string) => api.post('/organization/invite', { email, role }),
};
