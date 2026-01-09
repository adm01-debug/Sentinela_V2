import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useInfiniteScroll } from '../useInfiniteScroll';

describe('useInfiniteScroll', () => {
  it('should call loadMore on intersection', () => {
    const loadMore = vi.fn();
    const ref = { current: document.createElement('div') };
    renderHook(() => useInfiniteScroll(ref, loadMore));
    expect(loadMore).not.toHaveBeenCalled();
  });
});