import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useUnmount } from '../useUnmount';

describe('useUnmount', () => {
  it('should call cleanup on unmount', () => {
    const cleanup = vi.fn();
    const { unmount } = renderHook(() => useUnmount(cleanup));
    expect(cleanup).not.toHaveBeenCalled();
    unmount();
    expect(cleanup).toHaveBeenCalled();
  });
});