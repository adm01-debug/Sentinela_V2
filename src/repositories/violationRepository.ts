import { BaseRepository } from './baseRepository';
import type { Violation } from '@/types';
class ViolationRepository extends BaseRepository<Violation> {
  constructor() { super('/violations'); }
  async findByEmployee(employeeId: string) { return this.findAll({ employeeId }); }
  async findBySeverity(severity: string) { return this.findAll({ severity }); }
  async findPending() { return this.findAll({ status: 'pending' }); }
  async acknowledge(id: string) { return this.update(id, { status: 'acknowledged' } as any); }
  async resolve(id: string) { return this.update(id, { status: 'resolved', resolvedAt: new Date().toISOString() } as any); }
}
export const violationRepository = new ViolationRepository();
