import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from '../stores/authStore';

describe('authStore', () => {
  beforeEach(() => { useAuthStore.setState({ user: null, token: null, isAuthenticated: false }); });
  it('sets user on login', () => { const user = { id: '1', email: 'test@test.com', name: 'Test', role: 'admin' as const }; useAuthStore.getState().setUser(user); expect(useAuthStore.getState().user).toEqual(user); });
  it('clears state on logout', () => { useAuthStore.getState().setUser({ id: '1', email: 'test@test.com', name: 'Test', role: 'admin' as const }); useAuthStore.getState().logout(); expect(useAuthStore.getState().user).toBeNull(); });
});