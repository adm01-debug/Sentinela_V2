import { renderHook, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useMutation } from '../useMutation';

describe('useMutation', () => {
  it('should execute mutation', async () => {
    const mutationFn = vi.fn().mockResolvedValue({ data: 'success' });
    const { result } = renderHook(() => useMutation(mutationFn));
    act(() => { result.current.mutate({ id: 1 }); });
    await waitFor(() => expect(mutationFn).toHaveBeenCalled());
  });

  it('should track loading state', () => {
    const { result } = renderHook(() => useMutation(vi.fn()));
    expect(result.current.isLoading).toBe(false);
  });
});