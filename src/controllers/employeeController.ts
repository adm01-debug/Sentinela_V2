import { BaseController } from './baseController';
import { employeeRepository } from '@/repositories/employeeRepository';
class EmployeeController extends BaseController {
  async getAll(params?: any) { return this.success(await employeeRepository.findAll(params)); }
  async getById(id: string) { const e = await employeeRepository.findById(id); if (!e) return this.error('Employee not found', 404); return this.success(e); }
  async getByTeam(teamId: string) { return this.success(await employeeRepository.findByTeam(teamId)); }
  async create(data: any) { return this.success(await employeeRepository.create(data), 'Employee created'); }
  async update(id: string, data: any) { return this.success(await employeeRepository.update(id, data), 'Employee updated'); }
  async delete(id: string) { await employeeRepository.delete(id); return this.success(null, 'Employee deleted'); }
  async updateStatus(id: string, status: string) { return this.success(await employeeRepository.updateStatus(id, status)); }
}
export const employeeController = new EmployeeController();
