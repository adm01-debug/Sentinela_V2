import { api } from './api';
import type { ApiKey } from '@/types';

export const apiKeyService = {
  async getAll(): Promise<ApiKey[]> {
    return api.get('/api-keys');
  },
  async create(name: string, scopes: string[]): Promise<{ key: string; apiKey: ApiKey }> {
    return api.post('/api-keys', { name, scopes });
  },
  async revoke(id: string): Promise<void> {
    return api.delete(`/api-keys/${id}`);
  },
  async regenerate(id: string): Promise<{ key: string }> {
    return api.post(`/api-keys/${id}/regenerate`);
  },
  async updateScopes(id: string, scopes: string[]): Promise<ApiKey> {
    return api.put(`/api-keys/${id}`, { scopes });
  },
};
