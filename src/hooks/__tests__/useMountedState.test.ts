import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useMountedState } from '../useMountedState';

describe('useMountedState', () => {
  it('works', () => {
    const { result } = renderHook(() => useMountedState());
    expect(result.current).toBeDefined();
  });
});