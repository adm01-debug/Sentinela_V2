import { BaseRepository } from './baseRepository';
import type { Activity } from '@/types';
class ActivityRepository extends BaseRepository<Activity> {
  constructor() { super('/activities'); }
  async findByEmployee(employeeId: string, params?: Record<string, any>) { return this.findAll({ employeeId, ...params }); }
  async findByDateRange(startDate: string, endDate: string) { return this.findAll({ startDate, endDate }); }
  async getProductiveTime(employeeId: string, date: string) { const { data } = await (await import('@/plugins/axios')).api.get('/activities/productive-time', { params: { employeeId, date } }); return data; }
}
export const activityRepository = new ActivityRepository();
