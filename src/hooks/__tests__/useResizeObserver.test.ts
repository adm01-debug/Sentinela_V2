import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useResizeObserver } from '../useResizeObserver';

describe('useResizeObserver', () => {
  it('should observe resize', () => {
    const mockObserver = { observe: vi.fn(), unobserve: vi.fn(), disconnect: vi.fn() };
    global.ResizeObserver = vi.fn(() => mockObserver) as any;
    const ref = { current: document.createElement('div') };
    renderHook(() => useResizeObserver(ref));
    expect(mockObserver.observe).toHaveBeenCalled();
  });
});