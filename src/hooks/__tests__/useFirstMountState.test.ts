import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useFirstMountState } from '../useFirstMountState';

describe('useFirstMountState', () => {
  it('should return true on first render', () => {
    const { result } = renderHook(() => useFirstMountState());
    expect(result.current).toBe(true);
  });

  it('should return false on subsequent renders', () => {
    const { result, rerender } = renderHook(() => useFirstMountState());
    rerender();
    expect(result.current).toBe(false);
  });
});