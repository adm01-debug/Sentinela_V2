import { apiClient } from '@/lib/api';
import type { User, Session } from '@/types';

interface LoginResponse {
  token: string;
  refreshToken: string;
  user: User;
}

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/auth/login', { email, password });
    apiClient.setToken(response.token);
    return response;
  },
  async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
    apiClient.setToken(null);
  },
  async refreshToken(refreshToken: string): Promise<{ token: string }> {
    return apiClient.post('/auth/refresh', { refreshToken });
  },
  async me(): Promise<User> {
    return apiClient.get('/auth/me');
  },
  async updateProfile(data: Partial<User>): Promise<User> {
    return apiClient.put('/auth/profile', data);
  },
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    return apiClient.post('/auth/change-password', { currentPassword, newPassword });
  },
  async forgotPassword(email: string): Promise<void> {
    return apiClient.post('/auth/forgot-password', { email });
  },
  async resetPassword(token: string, password: string): Promise<void> {
    return apiClient.post('/auth/reset-password', { token, password });
  },
  async getSessions(): Promise<Session[]> {
    return apiClient.get('/auth/sessions');
  },
  async revokeSession(sessionId: string): Promise<void> {
    return apiClient.delete('/auth/sessions/' + sessionId);
  },
  async enable2FA(): Promise<{ qrCode: string; secret: string }> {
    return apiClient.post('/auth/2fa/enable');
  },
  async verify2FA(code: string): Promise<void> {
    return apiClient.post('/auth/2fa/verify', { code });
  },
  async disable2FA(code: string): Promise<void> {
    return apiClient.post('/auth/2fa/disable', { code });
  }
};