import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useResizeObserver } from '../useResizeObserver';

describe('useResizeObserver', () => {
  it('should observe element resize', () => {
    global.ResizeObserver = vi.fn(() => ({ observe: vi.fn(), unobserve: vi.fn(), disconnect: vi.fn() }));
    const ref = { current: document.createElement('div') };
    const { result } = renderHook(() => useResizeObserver(ref));
    expect(result.current).toBeDefined();
  });
});