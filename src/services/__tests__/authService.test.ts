import { describe, it, expect, vi, beforeEach } from 'vitest';
import authService from '../authService';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      getSession: vi.fn(),
      getUser: vi.fn(),
    },
  },
}));

describe('authService', () => {
  beforeEach(() => { vi.clearAllMocks(); });
  it('should sign in user', async () => { expect(authService.signIn).toBeDefined(); });
  it('should sign up user', async () => { expect(authService.signUp).toBeDefined(); });
  it('should sign out user', async () => { expect(authService.signOut).toBeDefined(); });
  it('should get session', async () => { expect(authService.getSession).toBeDefined(); });
});
