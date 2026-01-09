import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useTouch } from '../useTouch';

describe('useTouch', () => {
  it('should track touch events', () => {
    const ref = { current: document.createElement('div') };
    const { result } = renderHook(() => useTouch(ref));
    expect(result.current.touches).toBeDefined();
  });
});