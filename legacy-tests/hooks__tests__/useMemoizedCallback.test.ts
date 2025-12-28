import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useMemoizedCallback } from '../useMemoizedCallback';

describe('useMemoizedCallback', () => {
  it('works', () => {
    const { result } = renderHook(() => useMemoizedCallback());
    expect(result.current).toBeDefined();
  });
});