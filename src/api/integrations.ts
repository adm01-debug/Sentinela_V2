import { api } from './client';

export const integrationsApi = {
  list: () => api.get('/integrations'),
  get: (id: string) => api.get(`/integrations/${id}`),
  connect: (provider: string, config: any) => api.post('/integrations/connect', { provider, config }),
  disconnect: (id: string) => api.delete(`/integrations/${id}`),
  test: (id: string) => api.post(`/integrations/${id}/test`),
  sync: (id: string) => api.post(`/integrations/${id}/sync`),
};
