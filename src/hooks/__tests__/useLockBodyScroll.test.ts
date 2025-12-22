import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useLockBodyScroll } from '../useLockBodyScroll';

describe('useLockBodyScroll', () => {
  it('works', () => {
    const { result } = renderHook(() => useLockBodyScroll());
    expect(result.current).toBeDefined();
  });
});