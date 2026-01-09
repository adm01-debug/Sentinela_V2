import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useInfiniteQuery } from '../useInfiniteQuery';

describe('useInfiniteQuery', () => {
  it('should fetch pages', async () => {
    const fetcher = vi.fn().mockResolvedValue({ items: [1, 2], nextPage: 2 });
    const { result } = renderHook(() => useInfiniteQuery('key', fetcher));
    await waitFor(() => expect(result.current.data).toBeDefined());
  });

  it('should load more', async () => {
    const fetcher = vi.fn().mockResolvedValue({ items: [1], nextPage: 2 });
    const { result } = renderHook(() => useInfiniteQuery('key', fetcher));
    await waitFor(() => expect(result.current.hasNextPage).toBe(true));
  });
});