import { api } from './client';

export const violationsApi = {
  list: (params?: any) => api.get('/violations', { params }),
  get: (id: string) => api.get(`/violations/${id}`),
  acknowledge: (id: string) => api.post(`/violations/${id}/acknowledge`),
  resolve: (id: string, notes?: string) => api.post(`/violations/${id}/resolve`, { notes }),
  dismiss: (id: string, reason: string) => api.post(`/violations/${id}/dismiss`, { reason }),
  rules: () => api.get('/violations/rules'),
};
