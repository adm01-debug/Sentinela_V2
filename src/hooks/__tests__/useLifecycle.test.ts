import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useLifecycle } from '../useLifecycle';

describe('useLifecycle', () => {
  it('should call mount and unmount', () => {
    const onMount = vi.fn();
    const onUnmount = vi.fn();
    const { unmount } = renderHook(() => useLifecycle({ onMount, onUnmount }));
    expect(onMount).toHaveBeenCalled();
    unmount();
    expect(onUnmount).toHaveBeenCalled();
  });
});