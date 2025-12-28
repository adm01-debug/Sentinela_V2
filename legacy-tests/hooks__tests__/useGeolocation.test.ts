import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useGeolocation } from '../useGeolocation';

describe('useGeolocation', () => {
  it('works', () => {
    const { result } = renderHook(() => useGeolocation());
    expect(result.current).toBeDefined();
  });
});