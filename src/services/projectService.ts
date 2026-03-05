// Project Service for Sentinela v17
import { api } from './api';
import type { Project, ProjectCreateInput, ProjectUpdateInput, ProjectFilters, ProjectStats, ProjectMember } from '@/types/project';
import type { PaginatedResponse } from '@/types/pagination';

const BASE_URL = '/projects';

export const projectService = {
  async getAll(filters?: ProjectFilters, page = 1, pageSize = 20): Promise<PaginatedResponse<Project>> {
    const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
    if (filters) Object.entries(filters).forEach(([k, v]) => v !== undefined && params.append(k, String(v)));
    return api.get(`${BASE_URL}?${params}`);
  },

  async getById(id: string): Promise<Project> {
    return api.get(`${BASE_URL}/${id}`);
  },

  async create(data: ProjectCreateInput): Promise<Project> {
    return api.post(BASE_URL, data);
  },

  async update(id: string, data: ProjectUpdateInput): Promise<Project> {
    return api.put(`${BASE_URL}/${id}`, data);
  },

  async delete(id: string): Promise<void> {
    return api.delete(`${BASE_URL}/${id}`);
  },

  async archive(id: string): Promise<void> {
    return api.post(`${BASE_URL}/${id}/archive`);
  },

  async restore(id: string): Promise<void> {
    return api.post(`${BASE_URL}/${id}/restore`);
  },

  async getStats(): Promise<ProjectStats> {
    return api.get(`${BASE_URL}/stats`);
  },

  async getMembers(projectId: string): Promise<ProjectMember[]> {
    return api.get(`${BASE_URL}/${projectId}/members`);
  },

  async addMember(projectId: string, userId: string, role?: string): Promise<void> {
    return api.post(`${BASE_URL}/${projectId}/members`, { userId, role });
  },

  async removeMember(projectId: string, userId: string): Promise<void> {
    return api.delete(`${BASE_URL}/${projectId}/members/${userId}`);
  },

  async updateProgress(id: string, progress: number): Promise<void> {
    return api.put(`${BASE_URL}/${id}/progress`, { progress });
  },

  async getTimeline(id: string): Promise<unknown[]> {
    return api.get(`${BASE_URL}/${id}/timeline`);
  },
};

export default projectService;
