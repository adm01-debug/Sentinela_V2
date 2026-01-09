import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useSort } from '../useSort';
describe('useSort', () => {
  it('should sort items', () => {
    const items = [{ v: 3 }, { v: 1 }, { v: 2 }];
    const { result } = renderHook(() => useSort(items, 'v'));
    expect(result.current[0].v).toBe(1);
  });
});