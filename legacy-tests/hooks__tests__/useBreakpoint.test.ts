import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useBreakpoint } from '../useBreakpoint';

describe('useBreakpoint', () => {
  it('initializes correctly', () => {
    const { result } = renderHook(() => useBreakpoint());
    expect(result.current).toBeDefined();
  });
});