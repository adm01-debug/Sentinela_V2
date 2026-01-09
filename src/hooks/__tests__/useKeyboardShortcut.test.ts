import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useKeyboardShortcut } from '../useKeyboardShortcut';

describe('useKeyboardShortcut', () => {
  it('should trigger on shortcut', () => {
    const callback = vi.fn();
    renderHook(() => useKeyboardShortcut('ctrl+s', callback));
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 's', ctrlKey: true }));
    expect(callback).toHaveBeenCalled();
  });
});