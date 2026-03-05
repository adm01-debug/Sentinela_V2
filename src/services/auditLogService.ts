// Audit Log Service for Sentinela v17
import { api } from './api';
import type { AuditLog, AuditLogFilters, AuditLogStats, AuditLogExport, AuditRetentionPolicy } from '@/types/auditLog';
import type { PaginatedResponse } from '@/types/pagination';

const BASE_URL = '/audit-logs';

export const auditLogService = {
  async getAll(filters?: AuditLogFilters, page = 1, pageSize = 50): Promise<PaginatedResponse<AuditLog>> {
    const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
    if (filters) Object.entries(filters).forEach(([k, v]) => v !== undefined && params.append(k, String(v)));
    return api.get(`${BASE_URL}?${params}`);
  },

  async getById(id: string): Promise<AuditLog> {
    return api.get(`${BASE_URL}/${id}`);
  },

  async getStats(startDate?: string, endDate?: string): Promise<AuditLogStats> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    return api.get(`${BASE_URL}/stats?${params}`);
  },

  async export(options: AuditLogExport): Promise<{ url: string; expiresAt: string }> {
    return api.post(`${BASE_URL}/export`, options);
  },

  async getByUser(userId: string, page = 1, pageSize = 50): Promise<PaginatedResponse<AuditLog>> {
    return api.get(`${BASE_URL}/user/${userId}?page=${page}&pageSize=${pageSize}`);
  },

  async getByResource(resource: string, resourceId: string): Promise<AuditLog[]> {
    return api.get(`${BASE_URL}/resource/${resource}/${resourceId}`);
  },

  async getRetentionPolicies(): Promise<AuditRetentionPolicy[]> {
    return api.get(`${BASE_URL}/retention-policies`);
  },

  async updateRetentionPolicy(id: string, data: Partial<AuditRetentionPolicy>): Promise<AuditRetentionPolicy> {
    return api.put(`${BASE_URL}/retention-policies/${id}`, data);
  },

  async search(query: string, filters?: AuditLogFilters): Promise<AuditLog[]> {
    const params = new URLSearchParams({ q: query });
    if (filters) Object.entries(filters).forEach(([k, v]) => v !== undefined && params.append(k, String(v)));
    return api.get(`${BASE_URL}/search?${params}`);
  },

  async getRecentActivity(limit = 10): Promise<AuditLog[]> {
    return api.get(`${BASE_URL}/recent?limit=${limit}`);
  },
};

export default auditLogService;
