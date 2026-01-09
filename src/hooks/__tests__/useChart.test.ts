import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useChart } from '../useChart';

describe('useChart', () => {
  it('should prepare chart data', () => {
    const data = [{ x: 1, y: 10 }, { x: 2, y: 20 }];
    const { result } = renderHook(() => useChart(data));
    expect(result.current.series).toBeDefined();
  });
});