import { api } from './client';

interface ListParams {
  page?: number;
  limit?: number;
  type?: string;
  status?: 'pending' | 'completed' | 'failed';
  startDate?: string;
  endDate?: string;
}

interface ReportData {
  name: string;
  type: string;
  description?: string;
  parameters?: Record<string, unknown>;
}

interface GenerateParams {
  startDate: string;
  endDate: string;
  format?: 'pdf' | 'csv' | 'xlsx';
  filters?: Record<string, unknown>;
}

interface ScheduleData {
  reportType: string;
  cronExpression: string;
  recipients: string[];
  format?: 'pdf' | 'csv' | 'xlsx';
  parameters?: Record<string, unknown>;
}

export const reportsApi = {
  list: (params?: ListParams) => api.get('/reports', { params }),
  get: (id: string) => api.get(`/reports/${id}`),
  create: (data: ReportData) => api.post('/reports', data),
  generate: (type: string, params: GenerateParams) => api.post('/reports/generate', { type, ...params }),
  download: (id: string) => api.get(`/reports/${id}/download`, { responseType: 'blob' }),
  schedule: (data: ScheduleData) => api.post('/reports/schedule', data),
};

export type { ListParams, ReportData, GenerateParams, ScheduleData };
