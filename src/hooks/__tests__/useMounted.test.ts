import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useMounted } from '../useMounted';

describe('useMounted', () => {
  it('should return true when mounted', () => {
    const { result } = renderHook(() => useMounted());
    expect(result.current()).toBe(true);
  });

  it('should return false when unmounted', () => {
    const { result, unmount } = renderHook(() => useMounted());
    unmount();
    expect(result.current()).toBe(false);
  });
});