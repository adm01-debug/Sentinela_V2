import { apiClient } from '@/lib/api';
import type { User, PaginatedResponse } from '@/types';

export const userService = {
  async list(): Promise<PaginatedResponse<User>> {
    return apiClient.get('/users');
  },
  async get(id: string): Promise<User> {
    return apiClient.get('/users/' + id);
  },
  async create(data: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    return apiClient.post('/users', data);
  },
  async update(id: string, data: Partial<User>): Promise<User> {
    return apiClient.put('/users/' + id, data);
  },
  async delete(id: string): Promise<void> {
    return apiClient.delete('/users/' + id);
  },
  async invite(email: string, role: User['role']): Promise<void> {
    return apiClient.post('/users/invite', { email, role });
  },
  async resendInvite(id: string): Promise<void> {
    return apiClient.post('/users/' + id + '/resend-invite');
  },
  async deactivate(id: string): Promise<User> {
    return apiClient.post('/users/' + id + '/deactivate');
  },
  async activate(id: string): Promise<User> {
    return apiClient.post('/users/' + id + '/activate');
  }
};