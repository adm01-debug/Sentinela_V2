// Export Service for Sentinela v17
import { api } from './api';
import type { Export, ExportCreateInput, ExportFilters, ExportStats, ExportSchedule, ExportTemplate } from '@/types/export';
import type { PaginatedResponse } from '@/types/pagination';

const BASE_URL = '/exports';

export const exportService = {
  async getAll(filters?: ExportFilters, page = 1, pageSize = 20): Promise<PaginatedResponse<Export>> {
    const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
    if (filters) Object.entries(filters).forEach(([k, v]) => v !== undefined && params.append(k, String(v)));
    return api.get(`${BASE_URL}?${params}`);
  },

  async getById(id: string): Promise<Export> {
    return api.get(`${BASE_URL}/${id}`);
  },

  async create(data: ExportCreateInput): Promise<Export> {
    return api.post(BASE_URL, data);
  },

  async cancel(id: string): Promise<void> {
    return api.post(`${BASE_URL}/${id}/cancel`);
  },

  async download(id: string): Promise<Blob> {
    return api.get(`${BASE_URL}/${id}/download`, { responseType: 'blob' });
  },

  async getStats(): Promise<ExportStats> {
    return api.get(`${BASE_URL}/stats`);
  },

  async getSchedules(): Promise<ExportSchedule[]> {
    return api.get(`${BASE_URL}/schedules`);
  },

  async createSchedule(data: Omit<ExportSchedule, 'id' | 'createdAt' | 'updatedAt'>): Promise<ExportSchedule> {
    return api.post(`${BASE_URL}/schedules`, data);
  },

  async updateSchedule(id: string, data: Partial<ExportSchedule>): Promise<ExportSchedule> {
    return api.put(`${BASE_URL}/schedules/${id}`, data);
  },

  async deleteSchedule(id: string): Promise<void> {
    return api.delete(`${BASE_URL}/schedules/${id}`);
  },

  async getTemplates(): Promise<ExportTemplate[]> {
    return api.get(`${BASE_URL}/templates`);
  },

  async createFromTemplate(templateId: string, filters?: Record<string, unknown>): Promise<Export> {
    return api.post(`${BASE_URL}/templates/${templateId}/export`, { filters });
  },

  async retry(id: string): Promise<Export> {
    return api.post(`${BASE_URL}/${id}/retry`);
  },
};

export default exportService;
