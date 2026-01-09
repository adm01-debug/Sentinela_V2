import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useList } from '../useList';

describe('useList', () => {
  it('should initialize with empty list', () => {
    const { result } = renderHook(() => useList([]));
    expect(result.current.list).toEqual([]);
  });
  it('should push item', () => {
    const { result } = renderHook(() => useList([1, 2]));
    act(() => { result.current.push(3); });
    expect(result.current.list).toEqual([1, 2, 3]);
  });
  it('should remove item', () => {
    const { result } = renderHook(() => useList([1, 2, 3]));
    act(() => { result.current.removeAt(1); });
    expect(result.current.list).toEqual([1, 3]);
  });
});