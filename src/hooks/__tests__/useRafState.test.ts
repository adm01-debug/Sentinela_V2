import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useRafState } from '../useRafState';

describe('useRafState', () => {
  beforeEach(() => { vi.spyOn(window, 'requestAnimationFrame').mockImplementation(cb => { cb(0); return 0; }); });
  afterEach(() => { vi.restoreAllMocks(); });

  it('should update on next frame', () => {
    const { result } = renderHook(() => useRafState(0));
    act(() => { result.current[1](1); });
    expect(result.current[0]).toBe(1);
  });
});