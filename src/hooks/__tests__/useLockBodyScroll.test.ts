import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useLockBodyScroll } from '../useLockBodyScroll';
describe('useLockBodyScroll', () => {
  it('should lock body scroll', () => {
    const { unmount } = renderHook(() => useLockBodyScroll());
    expect(document.body.style.overflow).toBe('hidden');
    unmount();
  });
});