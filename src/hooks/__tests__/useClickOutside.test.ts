import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useClickOutside } from '../useClickOutside';
import { useRef } from 'react';

describe('useClickOutside', () => {
  let mockCallback: ReturnType<typeof vi.fn>;
  
  beforeEach(() => { mockCallback = vi.fn(); });

  it('should call callback when clicking outside', () => {
    const ref = { current: document.createElement('div') };
    document.body.appendChild(ref.current);
    renderHook(() => useClickOutside(ref, mockCallback));
    document.body.click();
    expect(mockCallback).toHaveBeenCalled();
    document.body.removeChild(ref.current);
  });

  it('should not call callback when clicking inside', () => {
    const ref = { current: document.createElement('div') };
    document.body.appendChild(ref.current);
    renderHook(() => useClickOutside(ref, mockCallback));
    ref.current.click();
    expect(mockCallback).not.toHaveBeenCalled();
    document.body.removeChild(ref.current);
  });

  it('should handle null ref', () => {
    const ref = { current: null };
    expect(() => renderHook(() => useClickOutside(ref, mockCallback))).not.toThrow();
  });
});
