import { apiClient } from '@/lib/api';
import type { Alert, AlertRule, PaginatedResponse } from '@/types';

export const alertService = {
  async list(filters?: { severity?: string; acknowledged?: boolean }): Promise<PaginatedResponse<Alert>> {
    return apiClient.get('/alerts', filters as Record<string, string>);
  },
  async get(id: string): Promise<Alert> {
    return apiClient.get('/alerts/' + id);
  },
  async acknowledge(id: string): Promise<Alert> {
    return apiClient.post('/alerts/' + id + '/acknowledge');
  },
  async acknowledgeAll(): Promise<void> {
    return apiClient.post('/alerts/acknowledge-all');
  },
  async delete(id: string): Promise<void> {
    return apiClient.delete('/alerts/' + id);
  },
  async getRules(): Promise<AlertRule[]> {
    return apiClient.get('/alerts/rules');
  },
  async createRule(rule: Omit<AlertRule, 'id'>): Promise<AlertRule> {
    return apiClient.post('/alerts/rules', rule);
  },
  async updateRule(id: string, rule: Partial<AlertRule>): Promise<AlertRule> {
    return apiClient.put('/alerts/rules/' + id, rule);
  },
  async deleteRule(id: string): Promise<void> {
    return apiClient.delete('/alerts/rules/' + id);
  }
};