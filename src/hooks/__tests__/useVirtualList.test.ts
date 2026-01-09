import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useVirtualList } from '../useVirtualList';

describe('useVirtualList', () => {
  it('should return virtual items', () => {
    const { result } = renderHook(() => useVirtualList({ itemCount: 100, itemHeight: 50, containerHeight: 500 }));
    expect(result.current.virtualItems.length).toBeLessThan(100);
  });
});