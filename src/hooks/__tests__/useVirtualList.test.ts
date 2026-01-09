import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useVirtualList } from '../useVirtualList';

describe('useVirtualList', () => {
  it('should return virtual items', () => {
    const items = Array.from({ length: 1000 }, (_, i) => i);
    const { result } = renderHook(() => useVirtualList({ items, itemHeight: 50 }));
    expect(result.current.virtualItems).toBeDefined();
  });

  it('should calculate visible range', () => {
    const items = Array.from({ length: 100 }, (_, i) => i);
    const { result } = renderHook(() => useVirtualList({ items, itemHeight: 50, containerHeight: 500 }));
    expect(result.current.virtualItems.length).toBeLessThan(items.length);
  });
});