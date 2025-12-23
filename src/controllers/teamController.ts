import { BaseController } from './baseController';
import { teamRepository } from '@/repositories/teamRepository';
class TeamController extends BaseController {
  async getAll(params?: any) { return this.success(await teamRepository.findAll(params)); }
  async getById(id: string) { const t = await teamRepository.findById(id); if (!t) return this.error('Team not found', 404); return this.success(t); }
  async create(data: any) { return this.success(await teamRepository.create(data), 'Team created'); }
  async update(id: string, data: any) { return this.success(await teamRepository.update(id, data), 'Team updated'); }
  async delete(id: string) { await teamRepository.delete(id); return this.success(null, 'Team deleted'); }
  async getMembers(teamId: string) { return this.success(await teamRepository.getMembers(teamId)); }
  async addMember(teamId: string, employeeId: string) { await teamRepository.addMember(teamId, employeeId); return this.success(null, 'Member added'); }
}
export const teamController = new TeamController();
