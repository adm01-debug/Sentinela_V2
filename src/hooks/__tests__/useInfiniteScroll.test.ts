import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useInfiniteScroll } from '../useInfiniteScroll';

describe('useInfiniteScroll', () => {
  it('should return loading state', () => {
    const loadMore = vi.fn();
    const { result } = renderHook(() => useInfiniteScroll({ loadMore, hasMore: true }));
    expect(result.current.loading).toBe(false);
  });
});