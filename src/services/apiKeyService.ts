import { api } from '@/utils/api';
import type { ApiKey } from '@/types';

export const apiKeyService = {
  async getAll(): Promise<ApiKey[]> {
    const { data } = await api.get('/api-keys');
    return data;
  },
  async create(name: string, scopes: string[]): Promise<{ key: string; apiKey: ApiKey }> {
    const { data } = await api.post('/api-keys', { name, scopes });
    return data;
  },
  async revoke(id: string): Promise<void> {
    await api.delete(`/api-keys/${id}`);
  },
  async regenerate(id: string): Promise<{ key: string }> {
    const { data } = await api.post(`/api-keys/${id}/regenerate`);
    return data;
  },
  async updateScopes(id: string, scopes: string[]): Promise<ApiKey> {
    const { data } = await api.patch(`/api-keys/${id}`, { scopes });
    return data;
  },
};
