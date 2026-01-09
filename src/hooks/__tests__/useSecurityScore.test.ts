import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useSecurityScore } from '../useSecurityScore';

describe('useSecurityScore', () => {
  it('should calculate security score', () => {
    const { result } = renderHook(() => useSecurityScore());
    expect(result.current.score).toBeDefined();
    expect(result.current.recommendations).toBeDefined();
  });
});