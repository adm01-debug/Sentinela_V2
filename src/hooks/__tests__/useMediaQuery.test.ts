import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useMediaQuery } from '../useMediaQuery';

describe('useMediaQuery', () => {
  const matchMediaMock = vi.fn();
  beforeEach(() => {
    window.matchMedia = matchMediaMock;
    matchMediaMock.mockReturnValue({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() });
  });

  it('should return false when query does not match', () => {
    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'));
    expect(result.current).toBe(false);
  });

  it('should return true when query matches', () => {
    matchMediaMock.mockReturnValue({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() });
    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'));
    expect(result.current).toBe(true);
  });
});