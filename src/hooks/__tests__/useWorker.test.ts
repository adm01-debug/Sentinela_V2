import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useWorker } from '../useWorker';

describe('useWorker', () => {
  it('should create worker', () => {
    const workerFn = () => { self.onmessage = (e) => self.postMessage(e.data * 2); };
    const { result } = renderHook(() => useWorker(workerFn));
    expect(result.current.postMessage).toBeDefined();
  });
});