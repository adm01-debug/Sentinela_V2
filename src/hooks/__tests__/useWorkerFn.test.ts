import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useWorkerFn } from '../useWorkerFn';

describe('useWorkerFn', () => {
  it('should run function in worker', async () => {
    const fn = (x: number) => x * 2;
    const { result } = renderHook(() => useWorkerFn(fn));
    expect(typeof result.current.run).toBe('function');
  });
});