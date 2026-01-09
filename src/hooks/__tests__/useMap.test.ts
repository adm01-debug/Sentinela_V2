import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useMap } from '../useMap';

describe('useMap', () => {
  it('should initialize with entries', () => {
    const { result } = renderHook(() => useMap([['a', 1]]));
    expect(result.current.get('a')).toBe(1);
  });
  it('should set value', () => {
    const { result } = renderHook(() => useMap<string, number>());
    act(() => { result.current.set('a', 1); });
    expect(result.current.get('a')).toBe(1);
  });
  it('should delete value', () => {
    const { result } = renderHook(() => useMap([['a', 1]]));
    act(() => { result.current.remove('a'); });
    expect(result.current.has('a')).toBe(false);
  });
});