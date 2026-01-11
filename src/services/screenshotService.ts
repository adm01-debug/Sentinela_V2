import { apiClient } from '@/lib/api';

interface Screenshot {
  id: string;
  employeeId: string;
  url: string;
  thumbnailUrl: string;
  timestamp: string;
  application?: string;
}

export const screenshotService = {
  async list(employeeId: string, date: string): Promise<Screenshot[]> {
    return apiClient.get('/screenshots', { employeeId, date });
  },
  async get(id: string): Promise<Screenshot> {
    return apiClient.get('/screenshots/' + id);
  },
  async delete(id: string): Promise<void> {
    return apiClient.delete('/screenshots/' + id);
  },
  async bulkDelete(ids: string[]): Promise<void> {
    return apiClient.post('/screenshots/bulk-delete', { ids });
  },
  async getLatest(employeeId: string): Promise<Screenshot | null> {
    const screenshots = await apiClient.get<Screenshot[]>('/screenshots', { employeeId, limit: '1' });
    return screenshots[0] || null;
  }
};