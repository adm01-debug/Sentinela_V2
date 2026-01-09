import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useReducedMotion } from '../useReducedMotion';

describe('useReducedMotion', () => {
  it('should detect reduced motion preference', () => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() });
    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(true);
  });
});