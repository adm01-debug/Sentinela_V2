// Import Service for Sentinela v17
import { api } from './api';
import type { Import, ImportCreateInput, ImportFilters, ImportStats, ImportTemplate, ImportValidation } from '@/types/import';
import type { PaginatedResponse } from '@/types/common';

const BASE_URL = '/imports';

export const importService = {
  async getAll(filters?: ImportFilters, page = 1, pageSize = 20): Promise<PaginatedResponse<Import>> {
    const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
    if (filters) Object.entries(filters).forEach(([k, v]) => v !== undefined && params.append(k, String(v)));
    return api.get(`${BASE_URL}?${params}`);
  },

  async getById(id: string): Promise<Import> {
    return api.get(`${BASE_URL}/${id}`);
  },

  async upload(file: File, resourceType: string): Promise<{ fileId: string; columns: string[]; rowCount: number }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('resourceType', resourceType);
    return api.post(`${BASE_URL}/upload`, formData);
  },

  async validate(data: ImportCreateInput): Promise<ImportValidation> {
    return api.post(`${BASE_URL}/validate`, data);
  },

  async create(data: ImportCreateInput): Promise<Import> {
    return api.post(BASE_URL, data);
  },

  async cancel(id: string): Promise<void> {
    return api.post(`${BASE_URL}/${id}/cancel`);
  },

  async retry(id: string): Promise<Import> {
    return api.post(`${BASE_URL}/${id}/retry`);
  },

  async getStats(): Promise<ImportStats> {
    return api.get(`${BASE_URL}/stats`);
  },

  async getTemplates(resourceType?: string): Promise<ImportTemplate[]> {
    const params = resourceType ? `?resourceType=${resourceType}` : '';
    return api.get(`${BASE_URL}/templates${params}`);
  },

  async downloadTemplate(resourceType: string, format: string): Promise<Blob> {
    return api.get(`${BASE_URL}/templates/${resourceType}/download?format=${format}`, { responseType: 'blob' });
  },

  async getFieldMappingSuggestions(fileId: string, resourceType: string): Promise<{ source: string; target: string; confidence: number }[]> {
    return api.get(`${BASE_URL}/mapping-suggestions?fileId=${fileId}&resourceType=${resourceType}`);
  },

  async previewData(fileId: string, limit = 10): Promise<Record<string, unknown>[]> {
    return api.get(`${BASE_URL}/preview/${fileId}?limit=${limit}`);
  },
};

export default importService;
