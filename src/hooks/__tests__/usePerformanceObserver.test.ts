import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { usePerformanceObserver } from '../usePerformanceObserver';

describe('usePerformanceObserver', () => {
  it('should observe performance', () => {
    global.PerformanceObserver = vi.fn(() => ({ observe: vi.fn(), disconnect: vi.fn() }));
    const { result } = renderHook(() => usePerformanceObserver(['paint']));
    expect(result.current.entries).toBeDefined();
  });
});