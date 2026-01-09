import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useMutation } from '../useMutation';

describe('useMutation', () => {
  it('should execute mutation', async () => {
    const mutationFn = vi.fn().mockResolvedValue({ success: true });
    const { result } = renderHook(() => useMutation(mutationFn));
    await act(async () => { await result.current.mutate({ data: 'test' }); });
    expect(mutationFn).toHaveBeenCalledWith({ data: 'test' });
  });

  it('should track loading', async () => {
    const mutationFn = vi.fn().mockResolvedValue({});
    const { result } = renderHook(() => useMutation(mutationFn));
    expect(result.current.isLoading).toBe(false);
  });

  it('should handle error', async () => {
    const mutationFn = vi.fn().mockRejectedValue(new Error('Mutation failed'));
    const { result } = renderHook(() => useMutation(mutationFn));
    await act(async () => { try { await result.current.mutate({}); } catch {} });
    expect(result.current.error).toBeDefined();
  });
});