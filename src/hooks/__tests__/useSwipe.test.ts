import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useSwipe } from '../useSwipe';

describe('useSwipe', () => {
  it('should detect swipe', () => {
    const onSwipe = vi.fn();
    const ref = { current: document.createElement('div') };
    renderHook(() => useSwipe(ref, { onSwipe }));
  });
});