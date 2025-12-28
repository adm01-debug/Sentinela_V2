import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useVirtualList } from '../useVirtualList';

describe('useVirtualList', () => {
  it('works', () => {
    const { result } = renderHook(() => useVirtualList());
    expect(result.current).toBeDefined();
  });
});