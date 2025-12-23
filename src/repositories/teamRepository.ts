import { BaseRepository } from './baseRepository';
import type { Team } from '@/types';
class TeamRepository extends BaseRepository<Team> {
  constructor() { super('/teams'); }
  async findByLeader(leaderId: string) { return this.findAll({ leaderId }); }
  async getMembers(teamId: string) { const { data } = await (await import('@/plugins/axios')).api.get('/teams/' + teamId + '/members'); return data; }
  async addMember(teamId: string, employeeId: string) { await (await import('@/plugins/axios')).api.post('/teams/' + teamId + '/members', { employeeId }); }
  async removeMember(teamId: string, employeeId: string) { await (await import('@/plugins/axios')).api.delete('/teams/' + teamId + '/members/' + employeeId); }
}
export const teamRepository = new TeamRepository();
