import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useAuth } from '../useAuth';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      getUser: vi.fn(),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      resetPasswordForEmail: vi.fn(),
      updateUser: vi.fn(),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } }
      })),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: null, error: null }))
        }))
      }))
    }))
  },
  isSupabaseReady: true
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Initial State', () => {
    it('should start with loading state', () => {
      const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });
      expect(result.current.isLoading).toBeDefined();
    });

    it('should have null user initially when not authenticated', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });
      await waitFor(() => {
        expect(result.current.user).toBeNull();
      });
    });
  });

  describe('signIn', () => {
    it('should call supabase signInWithPassword', async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      (supabase.auth.signInWithPassword as any).mockResolvedValue({
        data: { user: { id: '1', email: 'test@test.com' }, session: {} },
        error: null
      });

      const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });
      
      await act(async () => {
        await result.current.signIn?.('test@test.com', 'password123');
      });

      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@test.com',
        password: 'password123'
      });
    });

    it('should handle sign in error', async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      (supabase.auth.signInWithPassword as any).mockResolvedValue({
        data: null,
        error: { message: 'Invalid credentials' }
      });

      const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });
      
      await expect(
        act(async () => {
          await result.current.signIn?.('test@test.com', 'wrongpassword');
        })
      ).rejects.toBeDefined();
    });
  });

  describe('signUp', () => {
    it('should call supabase signUp', async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      (supabase.auth.signUp as any).mockResolvedValue({
        data: { user: { id: '1', email: 'new@test.com' }, session: {} },
        error: null
      });

      const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });
      
      await act(async () => {
        await result.current.signUp?.('new@test.com', 'password123');
      });

      expect(supabase.auth.signUp).toHaveBeenCalled();
    });
  });

  describe('signOut', () => {
    it('should call supabase signOut', async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      (supabase.auth.signOut as any).mockResolvedValue({ error: null });

      const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });
      
      await act(async () => {
        await result.current.signOut?.();
      });

      expect(supabase.auth.signOut).toHaveBeenCalled();
    });
  });

  describe('resetPassword', () => {
    it('should call supabase resetPasswordForEmail', async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      (supabase.auth.resetPasswordForEmail as any).mockResolvedValue({ error: null });

      const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });
      
      await act(async () => {
        await result.current.resetPassword?.('test@test.com');
      });

      expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(
        'test@test.com',
        expect.any(Object)
      );
    });
  });

  describe('isAuthenticated', () => {
    it('should return false when user is null', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });
      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(false);
      });
    });
  });
});
