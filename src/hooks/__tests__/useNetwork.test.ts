import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useNetwork } from '../useNetwork';

describe('useNetwork', () => {
  it('should return network state', () => {
    const { result } = renderHook(() => useNetwork());
    expect(result.current.online).toBeDefined();
  });

  it('should detect offline', () => {
    const { result } = renderHook(() => useNetwork());
    act(() => { window.dispatchEvent(new Event('offline')); });
    expect(result.current.online).toBe(false);
  });
});