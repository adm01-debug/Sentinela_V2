import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useNetworkState } from '../useNetworkState';

describe('useNetworkState', () => {
  it('should return online status', () => {
    const { result } = renderHook(() => useNetworkState());
    expect(result.current.online).toBe(navigator.onLine);
  });

  it('should update on change', () => {
    const { result } = renderHook(() => useNetworkState());
    act(() => { window.dispatchEvent(new Event('offline')); });
    expect(result.current.online).toBe(false);
  });
});