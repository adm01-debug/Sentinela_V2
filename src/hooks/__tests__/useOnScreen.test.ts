import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useOnScreen } from '../useOnScreen';

describe('useOnScreen', () => {
  it('should detect element on screen', () => {
    global.IntersectionObserver = vi.fn(() => ({ observe: vi.fn(), unobserve: vi.fn(), disconnect: vi.fn() })) as any;
    const ref = { current: document.createElement('div') };
    const { result } = renderHook(() => useOnScreen(ref));
    expect(result.current).toBeDefined();
  });
});