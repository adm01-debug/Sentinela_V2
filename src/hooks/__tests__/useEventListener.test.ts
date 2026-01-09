import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useEventListener } from '../useEventListener';
import { fireEvent } from '@testing-library/react';

describe('useEventListener', () => {
  it('should attach event listener', () => {
    const handler = vi.fn();
    renderHook(() => useEventListener('click', handler));
    fireEvent.click(window);
    expect(handler).toHaveBeenCalled();
  });
});