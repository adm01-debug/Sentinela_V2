import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useMap } from '../useMap';

describe('useMap', () => {
  it('should initialize with object', () => {
    const { result } = renderHook(() => useMap({ a: 1 }));
    expect(result.current[0].get('a')).toBe(1);
  });

  it('should set values', () => {
    const { result } = renderHook(() => useMap({}));
    act(() => { result.current[1].set('key', 'value'); });
    expect(result.current[0].get('key')).toBe('value');
  });

  it('should delete values', () => {
    const { result } = renderHook(() => useMap({ a: 1 }));
    act(() => { result.current[1].remove('a'); });
    expect(result.current[0].has('a')).toBe(false);
  });
});