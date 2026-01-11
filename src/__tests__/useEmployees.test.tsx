import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEmployees } from '../hooks/useEmployees';

vi.mock('@/services', () => ({ employeeService: { list: vi.fn().mockResolvedValue({ data: [], total: 0 }) } }));

describe('useEmployees', () => {
  const wrapper = ({ children }: any) => <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>{children}</QueryClientProvider>;
  it('fetches employees', async () => { const { result } = renderHook(() => useEmployees(), { wrapper }); await waitFor(() => expect(result.current.isLoading).toBe(false)); });
});