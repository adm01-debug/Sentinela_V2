import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useDeviceOrientation } from '../useDeviceOrientation';

describe('useDeviceOrientation', () => {
  it('initializes correctly', () => {
    const { result } = renderHook(() => useDeviceOrientation());
    expect(result.current).toBeDefined();
  });
});