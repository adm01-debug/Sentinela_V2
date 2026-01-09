import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useGeolocation } from '../useGeolocation';
describe('useGeolocation', () => {
  it('should return geolocation state', () => {
    const { result } = renderHook(() => useGeolocation());
    expect(result.current.loading).toBeDefined();
  });
});