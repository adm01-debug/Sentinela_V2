import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useSet } from '../useSet';

describe('useSet', () => {
  it('should initialize empty', () => {
    const { result } = renderHook(() => useSet());
    expect(result.current.size).toBe(0);
  });

  it('should add items', () => {
    const { result } = renderHook(() => useSet());
    act(() => { result.current.add(1); });
    expect(result.current.has(1)).toBe(true);
  });

  it('should remove items', () => {
    const { result } = renderHook(() => useSet([1, 2]));
    act(() => { result.current.remove(1); });
    expect(result.current.has(1)).toBe(false);
  });

  it('should toggle items', () => {
    const { result } = renderHook(() => useSet([1]));
    act(() => { result.current.toggle(1); });
    expect(result.current.has(1)).toBe(false);
    act(() => { result.current.toggle(1); });
    expect(result.current.has(1)).toBe(true);
  });
});