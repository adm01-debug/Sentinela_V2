import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useMap } from '../useMap';

describe('useMap', () => {
  it('should initialize with entries', () => {
    const { result } = renderHook(() => useMap([['a', 1]]));
    expect(result.current.get('a')).toBe(1);
  });

  it('should set values', () => {
    const { result } = renderHook(() => useMap());
    act(() => { result.current.set('key', 'value'); });
    expect(result.current.get('key')).toBe('value');
  });

  it('should delete values', () => {
    const { result } = renderHook(() => useMap([['a', 1]]));
    act(() => { result.current.remove('a'); });
    expect(result.current.has('a')).toBe(false);
  });
});