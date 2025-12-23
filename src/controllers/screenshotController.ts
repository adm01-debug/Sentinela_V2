import { BaseController } from './baseController';
import { screenshotRepository } from '@/repositories/screenshotRepository';
class ScreenshotController extends BaseController {
  async getAll(params?: any) { return this.success(await screenshotRepository.findAll(params)); }
  async getById(id: string) { const s = await screenshotRepository.findById(id); if (!s) return this.error('Screenshot not found', 404); return this.success(s); }
  async getByEmployee(employeeId: string, params?: any) { return this.success(await screenshotRepository.findByEmployee(employeeId, params)); }
  async getLatest(employeeId: string, limit?: number) { return this.success(await screenshotRepository.getLatest(employeeId, limit)); }
  async create(data: any) { return this.success(await screenshotRepository.create(data), 'Screenshot captured'); }
  async delete(id: string) { await screenshotRepository.delete(id); return this.success(null, 'Screenshot deleted'); }
}
export const screenshotController = new ScreenshotController();
