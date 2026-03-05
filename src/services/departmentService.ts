// Department Service for Sentinela v17
import { api } from './api';
import type { Department, DepartmentCreateInput, DepartmentUpdateInput, DepartmentFilters, DepartmentStats, DepartmentHierarchy } from '@/types/department';
import type { PaginatedResponse } from '@/types/pagination';

const BASE_URL = '/departments';

export const departmentService = {
  async getAll(filters?: DepartmentFilters, page = 1, pageSize = 20): Promise<PaginatedResponse<Department>> {
    const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
    if (filters) Object.entries(filters).forEach(([k, v]) => v !== undefined && params.append(k, String(v)));
    return api.get(`${BASE_URL}?${params}`);
  },

  async getById(id: string): Promise<Department> {
    return api.get(`${BASE_URL}/${id}`);
  },

  async create(data: DepartmentCreateInput): Promise<Department> {
    return api.post(BASE_URL, data);
  },

  async update(id: string, data: DepartmentUpdateInput): Promise<Department> {
    return api.put(`${BASE_URL}/${id}`, data);
  },

  async delete(id: string): Promise<void> {
    return api.delete(`${BASE_URL}/${id}`);
  },

  async getStats(): Promise<DepartmentStats> {
    return api.get(`${BASE_URL}/stats`);
  },

  async getHierarchy(): Promise<DepartmentHierarchy[]> {
    return api.get(`${BASE_URL}/hierarchy`);
  },

  async getTeams(departmentId: string): Promise<Department['teams']> {
    return api.get(`${BASE_URL}/${departmentId}/teams`);
  },

  async assignTeam(departmentId: string, teamId: string): Promise<void> {
    return api.post(`${BASE_URL}/${departmentId}/teams`, { teamId });
  },

  async removeTeam(departmentId: string, teamId: string): Promise<void> {
    return api.delete(`${BASE_URL}/${departmentId}/teams/${teamId}`);
  },

  async search(query: string): Promise<Department[]> {
    return api.get(`${BASE_URL}/search?q=${encodeURIComponent(query)}`);
  },
};

export default departmentService;
