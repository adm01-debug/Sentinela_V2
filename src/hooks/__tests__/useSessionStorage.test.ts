import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { useSessionStorage } from '../useSessionStorage';

describe('useSessionStorage', () => {
  beforeEach(() => { sessionStorage.clear(); });

  it('should store in sessionStorage', () => {
    const { result } = renderHook(() => useSessionStorage('key', 'value'));
    expect(result.current[0]).toBe('value');
  });

  it('should update value', () => {
    const { result } = renderHook(() => useSessionStorage('key', 'initial'));
    act(() => { result.current[1]('new'); });
    expect(JSON.parse(sessionStorage.getItem('key') || '')).toBe('new');
  });
});