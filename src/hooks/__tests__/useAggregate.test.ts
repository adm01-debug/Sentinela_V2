import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useAggregate } from '../useAggregate';

describe('useAggregate', () => {
  it('should aggregate data', () => {
    const data = [{ value: 10 }, { value: 20 }, { value: 30 }];
    const { result } = renderHook(() => useAggregate(data, 'value'));
    expect(result.current.sum).toBe(60);
    expect(result.current.avg).toBe(20);
  });
});