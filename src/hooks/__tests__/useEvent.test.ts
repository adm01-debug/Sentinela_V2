import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useEvent } from '../useEvent';

describe('useEvent', () => {
  it('should return stable callback', () => {
    const callback = vi.fn();
    const { result, rerender } = renderHook(({ cb }) => useEvent(cb), { initialProps: { cb: callback } });
    const first = result.current;
    rerender({ cb: vi.fn() });
    expect(result.current).toBe(first);
  });
});