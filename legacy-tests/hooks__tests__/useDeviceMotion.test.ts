import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useDeviceMotion } from '../useDeviceMotion';

describe('useDeviceMotion', () => {
  it('initializes correctly', () => {
    const { result } = renderHook(() => useDeviceMotion());
    expect(result.current).toBeDefined();
  });
});