import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useTimeTracking } from '../useTimeTracking';

describe('useTimeTracking', () => {
  it('should track time', () => {
    const { result } = renderHook(() => useTimeTracking());
    expect(result.current.isTracking).toBe(false);
    act(() => { result.current.start(); });
    expect(result.current.isTracking).toBe(true);
  });
});