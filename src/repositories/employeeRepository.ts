import { BaseRepository } from './baseRepository';
import type { Employee } from '@/types';
class EmployeeRepository extends BaseRepository<Employee> {
  constructor() { super('/employees'); }
  async findByTeam(teamId: string) { return this.findAll({ teamId }); }
  async findByDepartment(department: string) { return this.findAll({ department }); }
  async findActive() { return this.findAll({ status: 'active' }); }
  async updateStatus(id: string, status: string) { return this.update(id, { status } as any); }
}
export const employeeRepository = new EmployeeRepository();
