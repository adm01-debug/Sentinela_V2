import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useEventListener } from '../useEventListener';

describe('useEventListener', () => {
  it('should add event listener', () => {
    const handler = vi.fn();
    renderHook(() => useEventListener('click', handler));
    document.dispatchEvent(new Event('click'));
    expect(handler).toHaveBeenCalled();
  });

  it('should remove event listener on unmount', () => {
    const handler = vi.fn();
    const { unmount } = renderHook(() => useEventListener('click', handler));
    unmount();
    document.dispatchEvent(new Event('click'));
    expect(handler).toHaveBeenCalledTimes(0);
  });
});