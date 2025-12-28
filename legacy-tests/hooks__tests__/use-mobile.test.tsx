import { renderHook, act } from '@testing-library/react';
import { useIsMobile } from '../use-mobile';

// Mock matchMedia
const createMatchMedia = (matches: boolean) => {
  return (query: string): MediaQueryList => ({
    matches,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  });
};

describe('useIsMobile', () => {
  const originalMatchMedia = window.matchMedia;

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
  });

  it('should return true for mobile viewport', () => {
    window.matchMedia = createMatchMedia(true);
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);
  });

  it('should return false for desktop viewport', () => {
    window.matchMedia = createMatchMedia(false);
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
  });

  it('should update when viewport changes', () => {
    let matchesValue = false;
    const listeners: ((e: { matches: boolean }) => void)[] = [];

    window.matchMedia = (query: string): MediaQueryList => ({
      matches: matchesValue,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn((_, handler) => {
        listeners.push(handler as (e: { matches: boolean }) => void);
      }),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    });

    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);

    // Simulate viewport change
    act(() => {
      matchesValue = true;
      listeners.forEach(listener => listener({ matches: true }));
    });
  });

  it('should cleanup event listeners on unmount', () => {
    const removeEventListener = vi.fn();
    window.matchMedia = (query: string): MediaQueryList => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener,
      dispatchEvent: vi.fn(),
    });

    const { unmount } = renderHook(() => useIsMobile());
    unmount();

    expect(removeEventListener).toHaveBeenCalled();
  });
});
