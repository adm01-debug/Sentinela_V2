import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useSort } from '../useSort';

describe('useSort', () => {
  const items = [{ name: 'C' }, { name: 'A' }, { name: 'B' }];

  it('should sort items ascending', () => {
    const { result } = renderHook(() => useSort(items, 'name'));
    expect(result.current.sorted[0].name).toBe('A');
  });

  it('should toggle sort direction', () => {
    const { result } = renderHook(() => useSort(items, 'name'));
    act(() => { result.current.toggleDirection(); });
    expect(result.current.sorted[0].name).toBe('C');
  });
});