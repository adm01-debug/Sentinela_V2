import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { usePortal } from '../usePortal';

describe('usePortal', () => {
  it('should create portal container', () => {
    const { result } = renderHook(() => usePortal('test-portal'));
    expect(result.current).toBeDefined();
  });

  it('should cleanup on unmount', () => {
    const { unmount } = renderHook(() => usePortal('test-portal'));
    unmount();
    expect(document.getElementById('test-portal')).toBeNull();
  });
});