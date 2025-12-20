import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useKeyboardShortcut } from '../useKeyboardShortcut';

describe('useKeyboardShortcut', () => {
  it('should call callback on key press', () => {
    const callback = vi.fn();
    renderHook(() => useKeyboardShortcut('k', callback));

    const event = new KeyboardEvent('keydown', { key: 'k' });
    document.dispatchEvent(event);

    expect(callback).toHaveBeenCalled();
  });

  it('should handle modifier keys', () => {
    const callback = vi.fn();
    renderHook(() => useKeyboardShortcut('k', callback, { ctrlKey: true }));

    const event = new KeyboardEvent('keydown', { key: 'k', ctrlKey: true });
    document.dispatchEvent(event);

    expect(callback).toHaveBeenCalled();
  });

  it('should not call without required modifier', () => {
    const callback = vi.fn();
    renderHook(() => useKeyboardShortcut('k', callback, { ctrlKey: true }));

    const event = new KeyboardEvent('keydown', { key: 'k' });
    document.dispatchEvent(event);

    expect(callback).not.toHaveBeenCalled();
  });
});
