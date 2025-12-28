import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAsync, useAsyncCallback, useAsyncRetry } from '../useAsync';

describe('useAsync', () => {
  it('should start in idle state', () => {
    const asyncFn = vi.fn().mockResolvedValue('data');
    const { result } = renderHook(() => useAsync(asyncFn, false));

    expect(result.current.isIdle).toBe(true);
    expect(result.current.data).toBeUndefined();
  });

  it('should execute immediately when immediate is true', async () => {
    const asyncFn = vi.fn().mockResolvedValue('data');
    const { result } = renderHook(() => useAsync(asyncFn, true));

    expect(result.current.isPending).toBe(true);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBe('data');
  });

  it('should handle errors', async () => {
    const error = new Error('Test error');
    const asyncFn = vi.fn().mockRejectedValue(error);
    const { result } = renderHook(() => useAsync(asyncFn, true));

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBe(error);
  });

  it('should allow manual execution', async () => {
    const asyncFn = vi.fn().mockResolvedValue('data');
    const { result } = renderHook(() => useAsync(asyncFn, false));

    expect(result.current.isIdle).toBe(true);

    await act(async () => {
      await result.current.execute();
    });

    expect(result.current.isSuccess).toBe(true);
    expect(result.current.data).toBe('data');
  });
});

describe('useAsyncCallback', () => {
  it('should return stable execute function', async () => {
    const asyncFn = vi.fn().mockResolvedValue('data');
    const { result, rerender } = renderHook(() => useAsyncCallback(asyncFn));

    const firstExecute = result.current[0];
    rerender();
    const secondExecute = result.current[0];

    expect(firstExecute).toBe(secondExecute);
  });
});
