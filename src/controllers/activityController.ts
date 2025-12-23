import { BaseController } from './baseController';
import { activityRepository } from '@/repositories/activityRepository';
class ActivityController extends BaseController {
  async getAll(params?: any) { return this.success(await activityRepository.findAll(params)); }
  async getById(id: string) { const a = await activityRepository.findById(id); if (!a) return this.error('Activity not found', 404); return this.success(a); }
  async getByEmployee(employeeId: string, params?: any) { return this.success(await activityRepository.findByEmployee(employeeId, params)); }
  async getByDateRange(start: string, end: string) { return this.success(await activityRepository.findByDateRange(start, end)); }
  async create(data: any) { return this.success(await activityRepository.create(data), 'Activity recorded'); }
}
export const activityController = new ActivityController();
