import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useNetworkStatus } from '../useNetworkStatus';
describe('useNetworkStatus', () => {
  it('should return network status', () => {
    const { result } = renderHook(() => useNetworkStatus());
    expect(typeof result.current.online).toBe('boolean');
  });
});