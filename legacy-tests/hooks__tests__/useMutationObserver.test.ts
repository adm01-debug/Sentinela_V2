import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useMutationObserver } from '../useMutationObserver';

describe('useMutationObserver', () => {
  it('works', () => {
    const { result } = renderHook(() => useMutationObserver());
    expect(result.current).toBeDefined();
  });
});