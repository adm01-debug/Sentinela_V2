import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useNetworkStatus } from '../useNetworkStatus';

describe('useNetworkStatus', () => {
  const originalNavigator = { ...navigator };

  beforeEach(() => {
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      configurable: true,
      value: true,
    });
  });

  afterEach(() => {
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      configurable: true,
      value: originalNavigator.onLine,
    });
  });

  it('should return online status', () => {
    const { result } = renderHook(() => useNetworkStatus());

    expect(result.current.isOnline).toBe(true);
  });

  it('should detect offline status', () => {
    Object.defineProperty(navigator, 'onLine', { value: false });

    const { result } = renderHook(() => useNetworkStatus());

    expect(result.current.isOnline).toBe(false);
  });

  it('should update on online event', () => {
    Object.defineProperty(navigator, 'onLine', { value: false });
    const { result } = renderHook(() => useNetworkStatus());

    act(() => {
      Object.defineProperty(navigator, 'onLine', { value: true });
      window.dispatchEvent(new Event('online'));
    });

    expect(result.current.isOnline).toBe(true);
  });

  it('should update on offline event', () => {
    const { result } = renderHook(() => useNetworkStatus());

    act(() => {
      Object.defineProperty(navigator, 'onLine', { value: false });
      window.dispatchEvent(new Event('offline'));
    });

    expect(result.current.isOnline).toBe(false);
  });

  it('should clean up event listeners on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
    const { unmount } = renderHook(() => useNetworkStatus());

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('online', expect.any(Function));
    expect(removeEventListenerSpy).toHaveBeenCalledWith('offline', expect.any(Function));
    removeEventListenerSpy.mockRestore();
  });
});
