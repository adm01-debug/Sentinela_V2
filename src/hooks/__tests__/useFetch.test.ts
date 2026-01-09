import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useFetch } from '../useFetch';

describe('useFetch', () => {
  it('should fetch data', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({ data: 'test' }) });
    const { result } = renderHook(() => useFetch('/api/test'));
    await waitFor(() => expect(result.current.data).toEqual({ data: 'test' }));
  });

  it('should handle error', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Failed'));
    const { result } = renderHook(() => useFetch('/api/test'));
    await waitFor(() => expect(result.current.error).toBeDefined());
  });

  it('should track loading', () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({}) });
    const { result } = renderHook(() => useFetch('/api/test'));
    expect(result.current.loading).toBe(true);
  });
});