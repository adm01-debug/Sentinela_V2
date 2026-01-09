import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useSet } from '../useSet';

describe('useSet', () => {
  it('should initialize with values', () => {
    const { result } = renderHook(() => useSet([1, 2, 3]));
    expect(result.current.has(1)).toBe(true);
  });
  it('should add value', () => {
    const { result } = renderHook(() => useSet<number>([]));
    act(() => { result.current.add(1); });
    expect(result.current.has(1)).toBe(true);
  });
  it('should remove value', () => {
    const { result } = renderHook(() => useSet([1, 2]));
    act(() => { result.current.remove(1); });
    expect(result.current.has(1)).toBe(false);
  });
});