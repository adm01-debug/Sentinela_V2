import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useNetworkState } from '../useNetworkState';

describe('useNetworkState', () => {
  it('should return network info', () => {
    const { result } = renderHook(() => useNetworkState());
    expect(result.current.online).toBeDefined();
  });
});