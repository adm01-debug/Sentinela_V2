import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useAnalytics } from '../useAnalytics';

describe('useAnalytics', () => {
  it('initializes correctly', () => {
    const { result } = renderHook(() => useAnalytics());
    expect(result.current).toBeDefined();
  });
});