import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { useSessionStorage } from '../useSessionStorage';

describe('useSessionStorage', () => {
  beforeEach(() => { sessionStorage.clear(); });

  it('should return initial value', () => {
    const { result } = renderHook(() => useSessionStorage('key', 'initial'));
    expect(result.current[0]).toBe('initial');
  });

  it('should persist value', () => {
    const { result } = renderHook(() => useSessionStorage('key', 'initial'));
    act(() => { result.current[1]('updated'); });
    expect(sessionStorage.getItem('key')).toBe('"updated"');
  });
});