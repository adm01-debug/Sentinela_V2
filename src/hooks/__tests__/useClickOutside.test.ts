import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useClickOutside } from '../useClickOutside';
import { fireEvent } from '@testing-library/react';

describe('useClickOutside', () => {
  it('should call handler when clicking outside', () => {
    const handler = vi.fn();
    const ref = { current: document.createElement('div') };
    document.body.appendChild(ref.current);

    renderHook(() => useClickOutside(ref, handler));

    fireEvent.mouseDown(document.body);
    expect(handler).toHaveBeenCalled();

    document.body.removeChild(ref.current);
  });

  it('should not call handler when clicking inside', () => {
    const handler = vi.fn();
    const ref = { current: document.createElement('div') };
    document.body.appendChild(ref.current);

    renderHook(() => useClickOutside(ref, handler));

    fireEvent.mouseDown(ref.current);
    expect(handler).not.toHaveBeenCalled();

    document.body.removeChild(ref.current);
  });

  it('should cleanup event listener on unmount', () => {
    const handler = vi.fn();
    const ref = { current: document.createElement('div') };
    
    const { unmount } = renderHook(() => useClickOutside(ref, handler));
    unmount();

    fireEvent.mouseDown(document.body);
    expect(handler).not.toHaveBeenCalled();
  });
});
