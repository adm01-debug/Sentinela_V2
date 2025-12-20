import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useIntersectionObserver } from '../useIntersectionObserver';

describe('useIntersectionObserver', () => {
  const mockObserve = vi.fn();
  const mockUnobserve = vi.fn();
  const mockDisconnect = vi.fn();

  let intersectionCallback: IntersectionObserverCallback;

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock IntersectionObserver
    global.IntersectionObserver = vi.fn((callback) => {
      intersectionCallback = callback;
      return {
        observe: mockObserve,
        unobserve: mockUnobserve,
        disconnect: mockDisconnect,
        root: null,
        rootMargin: '',
        thresholds: [],
        takeRecords: () => [],
      };
    });
  });

  it('should create an IntersectionObserver', () => {
    const ref = { current: document.createElement('div') };
    renderHook(() => useIntersectionObserver(ref));

    expect(global.IntersectionObserver).toHaveBeenCalled();
  });

  it('should observe the element', () => {
    const element = document.createElement('div');
    const ref = { current: element };
    renderHook(() => useIntersectionObserver(ref));

    expect(mockObserve).toHaveBeenCalledWith(element);
  });

  it('should not observe if ref is null', () => {
    const ref = { current: null };
    renderHook(() => useIntersectionObserver(ref));

    expect(mockObserve).not.toHaveBeenCalled();
  });

  it('should return entry when intersecting', () => {
    const element = document.createElement('div');
    const ref = { current: element };
    const { result } = renderHook(() => useIntersectionObserver(ref));

    const mockEntry = {
      isIntersecting: true,
      intersectionRatio: 1,
      boundingClientRect: {} as DOMRectReadOnly,
      intersectionRect: {} as DOMRectReadOnly,
      rootBounds: null,
      target: element,
      time: Date.now(),
    };

    act(() => {
      intersectionCallback([mockEntry], {} as IntersectionObserver);
    });

    expect(result.current?.isIntersecting).toBe(true);
  });

  it('should disconnect on unmount', () => {
    const ref = { current: document.createElement('div') };
    const { unmount } = renderHook(() => useIntersectionObserver(ref));

    unmount();

    expect(mockDisconnect).toHaveBeenCalled();
  });

  it('should accept custom options', () => {
    const ref = { current: document.createElement('div') };
    const options = {
      threshold: 0.5,
      rootMargin: '10px',
    };

    renderHook(() => useIntersectionObserver(ref, options));

    expect(global.IntersectionObserver).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining(options)
    );
  });

  it('should handle freezeOnceVisible option', () => {
    const element = document.createElement('div');
    const ref = { current: element };
    const { result } = renderHook(() =>
      useIntersectionObserver(ref, { freezeOnceVisible: true })
    );

    const mockEntry = {
      isIntersecting: true,
      intersectionRatio: 1,
      boundingClientRect: {} as DOMRectReadOnly,
      intersectionRect: {} as DOMRectReadOnly,
      rootBounds: null,
      target: element,
      time: Date.now(),
    };

    act(() => {
      intersectionCallback([mockEntry], {} as IntersectionObserver);
    });

    expect(result.current?.isIntersecting).toBe(true);
  });
});
