import { api } from './client';

export const integrationsApi = {
  list: () => api.get('/integrations'),
  get: (id: string) => api.get(`/integrations/${id}`),
  connect: (type: string, data: Record<string, unknown>) => api.post(`/integrations/${type}/connect`, data),
  disconnect: (id: string) => api.delete(`/integrations/${id}`),
  test: (id: string) => api.post(`/integrations/${id}/test`),
};