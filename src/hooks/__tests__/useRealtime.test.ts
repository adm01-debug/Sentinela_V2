import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useRealtime } from '../useRealtime';

describe('useRealtime', () => {
  it('should subscribe to channel', () => {
    const { result } = renderHook(() => useRealtime('test-channel'));
    expect(result.current.status).toBeDefined();
  });
});