import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useAIInsights } from '../useAIInsights';

describe('useAIInsights', () => {
  it('should return AI insights', () => {
    const { result } = renderHook(() => useAIInsights());
    expect(result.current.insights).toBeDefined();
    expect(result.current.generate).toBeDefined();
  });
});