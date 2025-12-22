import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useMediaDevices } from '../useMediaDevices';

describe('useMediaDevices', () => {
  it('works', () => {
    const { result } = renderHook(() => useMediaDevices());
    expect(result.current).toBeDefined();
  });
});