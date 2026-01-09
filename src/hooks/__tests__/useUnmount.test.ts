import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useUnmount } from '../useUnmount';

describe('useUnmount', () => {
  it('should call callback on unmount', () => {
    const cb = vi.fn();
    const { unmount } = renderHook(() => useUnmount(cb));
    expect(cb).not.toHaveBeenCalled();
    unmount();
    expect(cb).toHaveBeenCalledTimes(1);
  });
});