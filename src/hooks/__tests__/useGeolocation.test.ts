import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useGeolocation } from '../useGeolocation';

describe('useGeolocation', () => {
  it('should return position state', () => {
    navigator.geolocation = { getCurrentPosition: vi.fn(), watchPosition: vi.fn(), clearWatch: vi.fn() } as any;
    const { result } = renderHook(() => useGeolocation());
    expect(result.current.loading).toBeDefined();
    expect(result.current.error).toBeDefined();
  });
});