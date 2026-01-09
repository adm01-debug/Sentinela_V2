import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useSummarize } from '../useSummarize';

describe('useSummarize', () => {
  it('should summarize data', () => {
    const data = [1, 2, 3, 4, 5];
    const { result } = renderHook(() => useSummarize(data));
    expect(result.current.count).toBe(5);
    expect(result.current.sum).toBe(15);
  });
});