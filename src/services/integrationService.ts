// Integration Service for Sentinela v17
import { api } from './api';
import type { Integration, IntegrationCreateInput, IntegrationUpdateInput, IntegrationFilters, IntegrationStats, IntegrationEvent } from '@/types/integration';
import type { PaginatedResponse } from '@/types/pagination';

const BASE_URL = '/integrations';

export const integrationService = {
  async getAll(filters?: IntegrationFilters): Promise<Integration[]> {
    const params = new URLSearchParams();
    if (filters) Object.entries(filters).forEach(([k, v]) => v !== undefined && params.append(k, String(v)));
    return api.get(`${BASE_URL}?${params}`);
  },

  async getById(id: string): Promise<Integration> {
    return api.get(`${BASE_URL}/${id}`);
  },

  async create(data: IntegrationCreateInput): Promise<Integration> {
    return api.post(BASE_URL, data);
  },

  async update(id: string, data: IntegrationUpdateInput): Promise<Integration> {
    return api.put(`${BASE_URL}/${id}`, data);
  },

  async delete(id: string): Promise<void> {
    return api.delete(`${BASE_URL}/${id}`);
  },

  async connect(id: string): Promise<{ authUrl?: string }> {
    return api.post(`${BASE_URL}/${id}/connect`);
  },

  async disconnect(id: string): Promise<void> {
    return api.post(`${BASE_URL}/${id}/disconnect`);
  },

  async sync(id: string): Promise<void> {
    return api.post(`${BASE_URL}/${id}/sync`);
  },

  async test(id: string): Promise<{ success: boolean; message: string }> {
    return api.post(`${BASE_URL}/${id}/test`);
  },

  async getEvents(id: string, page = 1, pageSize = 20): Promise<PaginatedResponse<IntegrationEvent>> {
    return api.get(`${BASE_URL}/${id}/events?page=${page}&pageSize=${pageSize}`);
  },

  async getStats(): Promise<IntegrationStats> {
    return api.get(`${BASE_URL}/stats`);
  },

  async getAvailableProviders(): Promise<{ provider: string; name: string; description: string }[]> {
    return api.get(`${BASE_URL}/providers`);
  },

  async refreshToken(id: string): Promise<void> {
    return api.post(`${BASE_URL}/${id}/refresh-token`);
  },
};

export default integrationService;
