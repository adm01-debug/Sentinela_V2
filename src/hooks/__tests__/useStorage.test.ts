import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { useStorage } from '../useStorage';

describe('useStorage', () => {
  beforeEach(() => { localStorage.clear(); sessionStorage.clear(); });

  it('should use localStorage by default', () => {
    const { result } = renderHook(() => useStorage('key', 'value'));
    expect(result.current[0]).toBe('value');
  });

  it('should update storage', () => {
    const { result } = renderHook(() => useStorage('key', 'initial'));
    act(() => { result.current[1]('updated'); });
    expect(localStorage.getItem('key')).toBe(JSON.stringify('updated'));
  });
});