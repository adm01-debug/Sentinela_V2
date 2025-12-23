import { BaseRepository } from './baseRepository';
import type { Report } from '@/types';
class ReportRepository extends BaseRepository<Report> {
  constructor() { super('/reports'); }
  async findByType(type: string) { return this.findAll({ type }); }
  async generate(type: string, params: Record<string, any>) { const { data } = await (await import('@/plugins/axios')).api.post('/reports/generate', { type, ...params }); return data; }
  async download(id: string, format: 'pdf' | 'csv' | 'xlsx') { const { data } = await (await import('@/plugins/axios')).api.get('/reports/' + id + '/download', { params: { format }, responseType: 'blob' }); return data; }
}
export const reportRepository = new ReportRepository();
