import { api } from '@/plugins/axios';
export class LogoutUseCase {
  async execute(): Promise<void> {
    try { await api.post('/auth/logout'); } catch {}
    localStorage.removeItem('auth_token');
    sessionStorage.clear();
  }
}
export const logoutUseCase = new LogoutUseCase();
