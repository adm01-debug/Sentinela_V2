import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useNumber } from '../useNumber';

describe('useNumber', () => {
  it('should initialize', () => {
    const { result } = renderHook(() => useNumber(5));
    expect(result.current.value).toBe(5);
  });

  it('should increment', () => {
    const { result } = renderHook(() => useNumber(0));
    act(() => { result.current.inc(); });
    expect(result.current.value).toBe(1);
  });

  it('should decrement', () => {
    const { result } = renderHook(() => useNumber(5));
    act(() => { result.current.dec(); });
    expect(result.current.value).toBe(4);
  });

  it('should respect min/max', () => {
    const { result } = renderHook(() => useNumber(5, { min: 0, max: 10 }));
    act(() => { result.current.set(15); });
    expect(result.current.value).toBe(10);
  });
});