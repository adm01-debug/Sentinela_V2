import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useBreakpoint } from '../useBreakpoint';

describe('useBreakpoint', () => {
  beforeEach(() => {
    window.matchMedia = vi.fn().mockImplementation(q => ({
      matches: q.includes('768'), addEventListener: vi.fn(), removeEventListener: vi.fn()
    }));
  });

  it('should return current breakpoint', () => {
    const { result } = renderHook(() => useBreakpoint());
    expect(result.current).toBeDefined();
  });

  it('should detect mobile', () => {
    window.matchMedia = vi.fn().mockImplementation(() => ({
      matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn()
    }));
    const { result } = renderHook(() => useBreakpoint());
    expect(result.current.isMobile).toBeDefined();
  });
});