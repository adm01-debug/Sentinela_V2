import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useInView } from '../useInView';

describe('useInView', () => {
  it('should return inView state', () => {
    global.IntersectionObserver = vi.fn(() => ({ observe: vi.fn(), unobserve: vi.fn(), disconnect: vi.fn() })) as any;
    const ref = { current: document.createElement('div') };
    const { result } = renderHook(() => useInView(ref));
    expect(result.current.inView).toBeDefined();
  });
});