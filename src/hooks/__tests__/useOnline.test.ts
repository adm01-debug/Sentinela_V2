import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useOnline } from '../useOnline';

describe('useOnline', () => {
  it('should return online status', () => {
    const { result } = renderHook(() => useOnline());
    expect(result.current).toBe(navigator.onLine);
  });

  it('should update on offline event', () => {
    const { result } = renderHook(() => useOnline());
    act(() => { window.dispatchEvent(new Event('offline')); });
    expect(result.current).toBe(false);
  });

  it('should update on online event', () => {
    const { result } = renderHook(() => useOnline());
    act(() => { window.dispatchEvent(new Event('online')); });
    expect(result.current).toBe(true);
  });
});