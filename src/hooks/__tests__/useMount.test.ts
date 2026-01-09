import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useMount } from '../useMount';

describe('useMount', () => {
  it('should call effect on mount', () => {
    const effect = vi.fn();
    renderHook(() => useMount(effect));
    expect(effect).toHaveBeenCalledTimes(1);
  });
});