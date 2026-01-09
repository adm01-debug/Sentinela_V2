import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { usePolicies } from '../usePolicies';

describe('usePolicies', () => {
  it('should manage policies', () => {
    const { result } = renderHook(() => usePolicies());
    expect(result.current.policies).toBeDefined();
    expect(typeof result.current.apply).toBe('function');
  });
});