import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useClickAway } from '../useClickAway';

describe('useClickAway', () => {
  it('should detect click away', () => {
    const callback = vi.fn();
    const element = document.createElement('div');
    document.body.appendChild(element);
    renderHook(() => useClickAway({ current: element }, callback));
    act(() => { document.body.click(); });
    expect(callback).toHaveBeenCalled();
    document.body.removeChild(element);
  });
});