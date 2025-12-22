import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useDeferredValue } from '../useDeferredValue';

describe('useDeferredValue', () => {
  it('initializes correctly', () => {
    const { result } = renderHook(() => useDeferredValue());
    expect(result.current).toBeDefined();
  });
});