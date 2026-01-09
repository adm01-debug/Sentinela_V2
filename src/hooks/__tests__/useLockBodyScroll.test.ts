import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useLockBodyScroll } from '../useLockBodyScroll';

describe('useLockBodyScroll', () => {
  it('should lock body scroll when active', () => {
    renderHook(() => useLockBodyScroll(true));
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('should unlock body scroll when inactive', () => {
    const { unmount } = renderHook(() => useLockBodyScroll(true));
    unmount();
    expect(document.body.style.overflow).not.toBe('hidden');
  });
});