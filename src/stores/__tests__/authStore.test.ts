import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from '../authStore';
describe('authStore', () => {
  beforeEach(() => { useAuthStore.setState({ user: null, token: null, isAuthenticated: false }); });
  it('sets user', () => { useAuthStore.getState().setUser({ id: '1', email: 'test@test.com', name: 'Test', role: 'admin' }); expect(useAuthStore.getState().user?.name).toBe('Test'); });
  it('logs out', () => { useAuthStore.getState().setUser({ id: '1', email: 'test@test.com', name: 'Test', role: 'admin' }); useAuthStore.getState().logout(); expect(useAuthStore.getState().user).toBeNull(); });
});