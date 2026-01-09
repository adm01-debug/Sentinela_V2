import { renderHook, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useAsync } from '../useAsync';

describe('useAsync', () => {
  it('should handle successful async operation', async () => {
    const asyncFn = vi.fn().mockResolvedValue('success');
    const { result } = renderHook(() => useAsync(asyncFn));
    act(() => { result.current.execute(); });
    await waitFor(() => expect(result.current.value).toBe('success'));
    expect(result.current.error).toBeNull();
  });

  it('should handle error', async () => {
    const asyncFn = vi.fn().mockRejectedValue(new Error('failed'));
    const { result } = renderHook(() => useAsync(asyncFn));
    act(() => { result.current.execute(); });
    await waitFor(() => expect(result.current.error).toBeDefined());
  });

  it('should track loading state', async () => {
    const asyncFn = vi.fn().mockResolvedValue('success');
    const { result } = renderHook(() => useAsync(asyncFn));
    expect(result.current.loading).toBe(false);
    act(() => { result.current.execute(); });
    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));
  });
});