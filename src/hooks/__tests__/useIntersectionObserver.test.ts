import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useIntersectionObserver } from '../useIntersectionObserver';

describe('useIntersectionObserver', () => {
  let observerCallback: IntersectionObserverCallback;
  
  beforeEach(() => {
    const mockObserver = vi.fn((cb) => {
      observerCallback = cb;
      return { observe: vi.fn(), unobserve: vi.fn(), disconnect: vi.fn() };
    });
    window.IntersectionObserver = mockObserver as any;
  });

  it('should return entry', () => {
    const ref = { current: document.createElement('div') };
    const { result } = renderHook(() => useIntersectionObserver(ref));
    expect(result.current).toBeDefined();
  });
});