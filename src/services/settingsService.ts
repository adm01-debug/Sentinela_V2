import { apiClient } from '@/lib/api';
import type { Settings } from '@/types';

export const settingsService = {
  async get(): Promise<Settings> {
    return apiClient.get('/settings');
  },
  async update(settings: Partial<Settings>): Promise<Settings> {
    return apiClient.put('/settings', settings);
  },
  async updateSection<K extends keyof Settings>(section: K, values: Partial<Settings[K]>): Promise<Settings> {
    return apiClient.patch('/settings/' + section, values);
  },
  async testSlackWebhook(webhook: string): Promise<boolean> {
    const result = await apiClient.post('/settings/test-slack', { webhook });
    return (result as { success: boolean }).success;
  },
  async testEmailSettings(email: string): Promise<boolean> {
    const result = await apiClient.post('/settings/test-email', { email });
    return (result as { success: boolean }).success;
  },
  async getAuditLog(): Promise<Array<{ action: string; user: string; timestamp: string; details: unknown }>> {
    return apiClient.get('/settings/audit-log');
  }
};