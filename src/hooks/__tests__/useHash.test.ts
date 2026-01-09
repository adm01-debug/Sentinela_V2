import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useHash } from '../useHash';

describe('useHash', () => {
  it('should get hash', () => {
    const { result } = renderHook(() => useHash());
    expect(result.current.hash).toBeDefined();
  });

  it('should set hash', () => {
    const { result } = renderHook(() => useHash());
    act(() => { result.current.setHash('test'); });
    expect(window.location.hash).toBe('#test');
  });
});