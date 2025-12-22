import { api } from './client';

export const violationsApi = {
  list: (params?: Record<string, unknown>) => api.get('/violations', { params }),
  get: (id: string) => api.get(`/violations/${id}`),
  acknowledge: (id: string) => api.post(`/violations/${id}/acknowledge`),
  rules: () => api.get('/violations/rules'),
  createRule: (data: Record<string, unknown>) => api.post('/violations/rules', data),
};