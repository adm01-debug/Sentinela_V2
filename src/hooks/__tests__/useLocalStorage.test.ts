import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { useLocalStorage } from '../useLocalStorage';

describe('useLocalStorage', () => {
  beforeEach(() => { localStorage.clear(); });

  it('should return initial value when no stored value', () => {
    const { result } = renderHook(() => useLocalStorage('key', 'initial'));
    expect(result.current[0]).toBe('initial');
  });

  it('should return stored value when present', () => {
    localStorage.setItem('key', JSON.stringify('stored'));
    const { result } = renderHook(() => useLocalStorage('key', 'initial'));
    expect(result.current[0]).toBe('stored');
  });

  it('should update stored value', () => {
    const { result } = renderHook(() => useLocalStorage('key', 'initial'));
    act(() => { result.current[1]('updated'); });
    expect(result.current[0]).toBe('updated');
    expect(JSON.parse(localStorage.getItem('key') || '')).toBe('updated');
  });

  it('should handle objects', () => {
    const { result } = renderHook(() => useLocalStorage('key', { a: 1 }));
    act(() => { result.current[1]({ a: 2, b: 3 }); });
    expect(result.current[0]).toEqual({ a: 2, b: 3 });
  });

  it('should handle function updates', () => {
    const { result } = renderHook(() => useLocalStorage('key', 0));
    act(() => { result.current[1]((prev: number) => prev + 1); });
    expect(result.current[0]).toBe(1);
  });
});
