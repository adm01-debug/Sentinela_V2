import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useCounter } from '../useCounter';

describe('useCounter', () => {
  it('initializes correctly', () => {
    const { result } = renderHook(() => useCounter());
    expect(result.current).toBeDefined();
  });
});