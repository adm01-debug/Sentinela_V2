import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useFeatureFlags } from '../useFeatureFlags';

describe('useFeatureFlags', () => {
  it('should check feature flags', () => {
    const { result } = renderHook(() => useFeatureFlags());
    expect(typeof result.current.isEnabled).toBe('function');
    expect(result.current.flags).toBeDefined();
  });
});