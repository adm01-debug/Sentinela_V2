import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useSortable } from '../useSortable';

describe('useSortable', () => {
  it('should return sorted items', () => {
    const { result } = renderHook(() => useSortable([3, 1, 2]));
    expect(result.current.items).toEqual([3, 1, 2]);
  });

  it('should move item', () => {
    const { result } = renderHook(() => useSortable(['a', 'b', 'c']));
    act(() => { result.current.move(0, 2); });
    expect(result.current.items).toEqual(['b', 'c', 'a']);
  });
});