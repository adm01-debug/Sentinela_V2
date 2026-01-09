import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useBreakpoint } from '../useBreakpoint';
describe('useBreakpoint', () => {
  it('should return breakpoint info', () => {
    const { result } = renderHook(() => useBreakpoint());
    expect(typeof result.current.isMobile).toBe('boolean');
  });
});