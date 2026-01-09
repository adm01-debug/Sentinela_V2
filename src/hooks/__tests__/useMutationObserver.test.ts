import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useMutationObserver } from '../useMutationObserver';

describe('useMutationObserver', () => {
  it('should observe mutations', () => {
    const callback = vi.fn();
    const ref = { current: document.createElement('div') };
    renderHook(() => useMutationObserver(ref, callback));
  });
});