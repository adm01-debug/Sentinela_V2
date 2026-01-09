import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useHotkeys } from '../useHotkeys';

describe('useHotkeys', () => {
  it('should register hotkey', () => {
    const callback = vi.fn();
    renderHook(() => useHotkeys([{ key: 'Escape', callback }]));
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(callback).toHaveBeenCalled();
  });
});