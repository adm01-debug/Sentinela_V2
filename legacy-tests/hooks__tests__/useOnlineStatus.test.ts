import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useOnlineStatus } from '../useOnlineStatus';

describe('useOnlineStatus', () => {
  const originalNavigator = { ...navigator };

  beforeEach(() => {
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true,
    });
  });

  afterEach(() => {
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: originalNavigator.onLine,
    });
  });

  it('should return true when online', () => {
    const { result } = renderHook(() => useOnlineStatus());
    expect(result.current).toBe(true);
  });

  it('should update on online event', () => {
    Object.defineProperty(navigator, 'onLine', { value: false });
    const { result } = renderHook(() => useOnlineStatus());

    act(() => {
      Object.defineProperty(navigator, 'onLine', { value: true });
      window.dispatchEvent(new Event('online'));
    });

    expect(result.current).toBe(true);
  });

  it('should update on offline event', () => {
    const { result } = renderHook(() => useOnlineStatus());

    act(() => {
      Object.defineProperty(navigator, 'onLine', { value: false });
      window.dispatchEvent(new Event('offline'));
    });

    expect(result.current).toBe(false);
  });
});
