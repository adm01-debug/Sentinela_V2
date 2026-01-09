import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useList } from '../useList';

describe('useList', () => {
  it('should initialize with array', () => {
    const { result } = renderHook(() => useList([1, 2, 3]));
    expect(result.current[0]).toEqual([1, 2, 3]);
  });

  it('should push items', () => {
    const { result } = renderHook(() => useList([1]));
    act(() => { result.current[1].push(2); });
    expect(result.current[0]).toEqual([1, 2]);
  });

  it('should remove items', () => {
    const { result } = renderHook(() => useList([1, 2, 3]));
    act(() => { result.current[1].removeAt(1); });
    expect(result.current[0]).toEqual([1, 3]);
  });

  it('should clear list', () => {
    const { result } = renderHook(() => useList([1, 2, 3]));
    act(() => { result.current[1].clear(); });
    expect(result.current[0]).toEqual([]);
  });
});