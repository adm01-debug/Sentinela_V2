import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useStep } from '../useStep';

describe('useStep', () => {
  it('works', () => {
    const { result } = renderHook(() => useStep());
    expect(result.current).toBeDefined();
  });
});