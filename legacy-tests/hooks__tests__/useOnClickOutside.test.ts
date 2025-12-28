import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useOnClickOutside } from '../useOnClickOutside';
import { useRef } from 'react';

describe('useOnClickOutside', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  it('should call handler when clicking outside', () => {
    const handler = vi.fn();
    const ref = { current: container };

    renderHook(() => useOnClickOutside(ref, handler));

    // Create and click an element outside the ref
    const outsideElement = document.createElement('button');
    document.body.appendChild(outsideElement);

    act(() => {
      outsideElement.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    });

    expect(handler).toHaveBeenCalledTimes(1);

    document.body.removeChild(outsideElement);
  });

  it('should not call handler when clicking inside', () => {
    const handler = vi.fn();
    const ref = { current: container };

    renderHook(() => useOnClickOutside(ref, handler));

    act(() => {
      container.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    });

    expect(handler).not.toHaveBeenCalled();
  });

  it('should handle null ref', () => {
    const handler = vi.fn();
    const ref = { current: null };

    // Should not throw
    expect(() => {
      renderHook(() => useOnClickOutside(ref, handler));
    }).not.toThrow();
  });

  it('should clean up event listener on unmount', () => {
    const handler = vi.fn();
    const ref = { current: container };
    const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');

    const { unmount } = renderHook(() => useOnClickOutside(ref, handler));

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalled();
    removeEventListenerSpy.mockRestore();
  });
});
