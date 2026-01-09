import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { useSessionStorage } from '../useSessionStorage';
describe('useSessionStorage', () => {
  beforeEach(() => sessionStorage.clear());
  it('should store value', () => {
    const { result } = renderHook(() => useSessionStorage('key', 'val'));
    expect(result.current[0]).toBe('val');
    act(() => { result.current[1]('new'); });
    expect(result.current[0]).toBe('new');
  });
});