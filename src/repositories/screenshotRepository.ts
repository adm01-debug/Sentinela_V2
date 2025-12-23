import { BaseRepository } from './baseRepository';
import type { Screenshot } from '@/types';
class ScreenshotRepository extends BaseRepository<Screenshot> {
  constructor() { super('/screenshots'); }
  async findByEmployee(employeeId: string, params?: Record<string, any>) { return this.findAll({ employeeId, ...params }); }
  async findByDateRange(startDate: string, endDate: string) { return this.findAll({ startDate, endDate }); }
  async getLatest(employeeId: string, limit = 10) { return this.findAll({ employeeId, limit, orderBy: 'capturedAt', order: 'desc' }); }
}
export const screenshotRepository = new ScreenshotRepository();
