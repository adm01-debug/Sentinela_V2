import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useSet } from '../useSet';

describe('useSet', () => {
  it('should initialize with values', () => {
    const { result } = renderHook(() => useSet([1, 2, 3]));
    expect(result.current[0].has(1)).toBe(true);
  });

  it('should add values', () => {
    const { result } = renderHook(() => useSet());
    act(() => { result.current[1].add(1); });
    expect(result.current[0].has(1)).toBe(true);
  });

  it('should remove values', () => {
    const { result } = renderHook(() => useSet([1, 2]));
    act(() => { result.current[1].remove(1); });
    expect(result.current[0].has(1)).toBe(false);
  });
});