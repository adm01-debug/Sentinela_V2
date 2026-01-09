import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useBeforeUnload } from '../useBeforeUnload';

describe('useBeforeUnload', () => {
  it('should add beforeunload listener', () => {
    const spy = vi.spyOn(window, 'addEventListener');
    renderHook(() => useBeforeUnload(true));
    expect(spy).toHaveBeenCalledWith('beforeunload', expect.any(Function));
    spy.mockRestore();
  });
});