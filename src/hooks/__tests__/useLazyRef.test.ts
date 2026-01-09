import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useLazyRef } from '../useLazyRef';

describe('useLazyRef', () => {
  it('should initialize lazily', () => {
    const init = vi.fn(() => 'value');
    const { result } = renderHook(() => useLazyRef(init));
    expect(result.current.current).toBe('value');
    expect(init).toHaveBeenCalledTimes(1);
  });
});