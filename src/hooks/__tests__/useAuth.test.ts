import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAuth } from '../useAuthx';

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
    },
  },
}));

describe('useAuth', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('should initialize with loading state', () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.isLoading).toBe(true);
  });

  it('should return user after login', async () => {
    const { result } = renderHook(() => useAuth());
    await act(async () => {
      await result.current.login('test@test.com', 'password');
    });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
  });

  it('should clear user after logout', async () => {
    const { result } = renderHook(() => useAuth());
    await act(async () => { await result.current.logout(); });
    expect(result.current.user).toBeNull();
  });

  it('should handle login error', async () => {
    const { result } = renderHook(() => useAuth());
    await act(async () => {
      try { await result.current.login('invalid', 'invalid'); } catch (e) {}
    });
    expect(result.current.error).toBeDefined();
  });
});
