import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useSingleton } from '../useSingleton';

describe('useSingleton', () => {
  it('should create singleton', () => {
    const factory = vi.fn(() => ({ value: 1 }));
    renderHook(() => useSingleton(factory));
    renderHook(() => useSingleton(factory));
    expect(factory).toHaveBeenCalledTimes(1);
  });
});