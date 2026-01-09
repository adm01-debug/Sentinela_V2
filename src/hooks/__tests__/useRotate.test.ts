import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useRotate } from '../useRotate';

describe('useRotate', () => {
  it('should track rotation', () => {
    const ref = { current: document.createElement('div') };
    const { result } = renderHook(() => useRotate(ref));
    expect(result.current.angle).toBe(0);
  });
});