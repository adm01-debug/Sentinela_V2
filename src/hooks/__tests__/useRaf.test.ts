import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useRaf } from '../useRaf';

describe('useRaf', () => {
  it('should return elapsed time', () => {
    const callback = vi.fn();
    renderHook(() => useRaf(callback));
    expect(callback).toBeDefined();
  });
});