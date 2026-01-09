import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useSafeState } from '../useSafeState';

describe('useSafeState', () => {
  it('should update state safely', () => {
    const { result } = renderHook(() => useSafeState(0));
    act(() => { result.current[1](1); });
    expect(result.current[0]).toBe(1);
  });

  it('should not update after unmount', () => {
    const { result, unmount } = renderHook(() => useSafeState(0));
    unmount();
    expect(() => result.current[1](1)).not.toThrow();
  });
});