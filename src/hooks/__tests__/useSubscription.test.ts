import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useSubscription } from '../useSubscription';

describe('useSubscription', () => {
  it('should handle subscription', () => {
    const { result } = renderHook(() => useSubscription({ topic: 'test' }));
    expect(result.current.data).toBeDefined();
  });
});