import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useQuery } from '../useQuery';

describe('useQuery', () => {
  it('should fetch and cache data', async () => {
    const queryFn = vi.fn().mockResolvedValue({ items: [] });
    const { result } = renderHook(() => useQuery('test-key', queryFn));
    await waitFor(() => expect(result.current.data).toEqual({ items: [] }));
  });

  it('should return loading state', () => {
    const queryFn = vi.fn().mockResolvedValue({});
    const { result } = renderHook(() => useQuery('key', queryFn));
    expect(result.current.isLoading).toBe(true);
  });
});