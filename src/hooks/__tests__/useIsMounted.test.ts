import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useIsMounted } from '../useIsMounted';

describe('useIsMounted', () => {
  it('should return true when mounted', () => {
    const { result } = renderHook(() => useIsMounted());
    expect(result.current()).toBe(true);
  });

  it('should return false after unmount', () => {
    const { result, unmount } = renderHook(() => useIsMounted());
    unmount();
    expect(result.current()).toBe(false);
  });
});