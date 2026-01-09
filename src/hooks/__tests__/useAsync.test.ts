import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useAsync } from '../useAsync';

describe('useAsync', () => {
  it('should start with loading state', () => {
    const asyncFn = vi.fn(() => new Promise(() => {}));
    const { result } = renderHook(() => useAsync(asyncFn));

    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('should return data on success', async () => {
    const asyncFn = vi.fn(() => Promise.resolve('data'));
    const { result } = renderHook(() => useAsync(asyncFn));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toBe('data');
    expect(result.current.error).toBeNull();
  });

  it('should return error on failure', async () => {
    const error = new Error('test error');
    const asyncFn = vi.fn(() => Promise.reject(error));
    const { result } = renderHook(() => useAsync(asyncFn));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBe(error);
  });

  it('should re-execute on execute call', async () => {
    let count = 0;
    const asyncFn = vi.fn(() => Promise.resolve(++count));
    const { result } = renderHook(() => useAsync(asyncFn, false));

    expect(result.current.data).toBeNull();

    await act(async () => {
      await result.current.execute();
    });

    expect(result.current.data).toBe(1);

    await act(async () => {
      await result.current.execute();
    });

    expect(result.current.data).toBe(2);
  });
});
