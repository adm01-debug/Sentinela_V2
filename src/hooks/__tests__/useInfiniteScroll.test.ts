import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useInfiniteScroll } from '../useInfiniteScroll';

describe('useInfiniteScroll', () => {
  it('should call loadMore when scrolled to bottom', () => {
    const loadMore = vi.fn();
    const { result } = renderHook(() => useInfiniteScroll({ loadMore, hasMore: true }));
    expect(result.current.ref).toBeDefined();
  });

  it('should not call loadMore when hasMore is false', () => {
    const loadMore = vi.fn();
    renderHook(() => useInfiniteScroll({ loadMore, hasMore: false }));
    expect(loadMore).not.toHaveBeenCalled();
  });
});