import { BaseController } from './baseController';
import { reportRepository } from '@/repositories/reportRepository';
class ReportController extends BaseController {
  async getAll(params?: any) { return this.success(await reportRepository.findAll(params)); }
  async getById(id: string) { const r = await reportRepository.findById(id); if (!r) return this.error('Report not found', 404); return this.success(r); }
  async getByType(type: string) { return this.success(await reportRepository.findByType(type)); }
  async generate(type: string, params: any) { return this.success(await reportRepository.generate(type, params), 'Report generated'); }
  async download(id: string, format: 'pdf' | 'csv' | 'xlsx') { return this.success(await reportRepository.download(id, format)); }
  async delete(id: string) { await reportRepository.delete(id); return this.success(null, 'Report deleted'); }
}
export const reportController = new ReportController();
