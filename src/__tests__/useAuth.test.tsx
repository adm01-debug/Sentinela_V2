import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useLogin } from '../hooks/useAuth';

vi.mock('@/services', () => ({ authService: { login: vi.fn().mockResolvedValue({ token: 'test', user: { id: '1' } }) } }));
vi.mock('@/stores', () => ({ useAuthStore: () => ({ setUser: vi.fn(), setToken: vi.fn() }) }));

describe('useLogin', () => {
  const wrapper = ({ children }: any) => <QueryClientProvider client={new QueryClient()}>{children}</QueryClientProvider>;
  it('returns mutate function', () => { const { result } = renderHook(() => useLogin(), { wrapper }); expect(result.current.mutate).toBeDefined(); });
});