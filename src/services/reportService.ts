import { apiClient } from '@/lib/api';
import type { Report, ReportFilters, ReportTemplate, PaginatedResponse } from '@/types';

export const reportService = {
  async list(): Promise<PaginatedResponse<Report>> {
    return apiClient.get('/reports');
  },
  async get(id: string): Promise<Report> {
    return apiClient.get('/reports/' + id);
  },
  async generate(type: Report['type'], filters: ReportFilters, format: Report['format'] = 'pdf'): Promise<Report> {
    return apiClient.post('/reports/generate', { type, filters, format });
  },
  async download(id: string): Promise<Blob> {
    return apiClient.get('/reports/' + id + '/download');
  },
  async delete(id: string): Promise<void> {
    return apiClient.delete('/reports/' + id);
  },
  async getTemplates(): Promise<ReportTemplate[]> {
    return apiClient.get('/reports/templates');
  },
  async schedule(templateId: string, schedule: string, filters: ReportFilters): Promise<void> {
    return apiClient.post('/reports/schedule', { templateId, schedule, filters });
  }
};