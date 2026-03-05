// Team Service for Sentinela v17
import { api } from './api';
import type { Team, TeamCreateInput, TeamUpdateInput, TeamFilters, TeamStats, AddMemberInput } from '@/types/team';
import type { PaginatedResponse } from '@/types/pagination';

const BASE_URL = '/teams';

export const teamService = {
  async getAll(filters?: TeamFilters, page = 1, pageSize = 20): Promise<PaginatedResponse<Team>> {
    const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
    if (filters) Object.entries(filters).forEach(([k, v]) => v !== undefined && params.append(k, String(v)));
    return api.get(`${BASE_URL}?${params}`);
  },

  async getById(id: string): Promise<Team> {
    return api.get(`${BASE_URL}/${id}`);
  },

  async create(data: TeamCreateInput): Promise<Team> {
    return api.post(BASE_URL, data);
  },

  async update(id: string, data: TeamUpdateInput): Promise<Team> {
    return api.put(`${BASE_URL}/${id}`, data);
  },

  async delete(id: string): Promise<void> {
    return api.delete(`${BASE_URL}/${id}`);
  },

  async getStats(): Promise<TeamStats> {
    return api.get(`${BASE_URL}/stats`);
  },

  async getMembers(teamId: string): Promise<Team['members']> {
    return api.get(`${BASE_URL}/${teamId}/members`);
  },

  async addMember(teamId: string, data: AddMemberInput): Promise<void> {
    return api.post(`${BASE_URL}/${teamId}/members`, data);
  },

  async removeMember(teamId: string, userId: string): Promise<void> {
    return api.delete(`${BASE_URL}/${teamId}/members/${userId}`);
  },

  async updateMemberRole(teamId: string, userId: string, role: string): Promise<void> {
    return api.put(`${BASE_URL}/${teamId}/members/${userId}`, { role });
  },

  async getHierarchy(): Promise<Team[]> {
    return api.get(`${BASE_URL}/hierarchy`);
  },

  async search(query: string): Promise<Team[]> {
    return api.get(`${BASE_URL}/search?q=${encodeURIComponent(query)}`);
  },
};

export default teamService;
