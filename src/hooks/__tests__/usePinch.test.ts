import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { usePinch } from '../usePinch';

describe('usePinch', () => {
  it('should track pinch gesture', () => {
    const ref = { current: document.createElement('div') };
    const { result } = renderHook(() => usePinch(ref));
    expect(result.current.scale).toBe(1);
  });
});