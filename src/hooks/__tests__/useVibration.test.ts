import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useVibration } from '../useVibration';
describe('useVibration', () => {
  it('should provide vibrate function', () => {
    navigator.vibrate = vi.fn();
    const { result } = renderHook(() => useVibration());
    expect(typeof result.current.vibrate).toBe('function');
  });
});