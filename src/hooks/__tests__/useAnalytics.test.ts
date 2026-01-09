import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useAnalytics } from '../useAnalytics';

describe('useAnalytics', () => {
  it('should track events', () => {
    const { result } = renderHook(() => useAnalytics());
    expect(typeof result.current.track).toBe('function');
    expect(typeof result.current.identify).toBe('function');
  });
});