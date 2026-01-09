import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useDashboard } from '../useDashboard';

describe('useDashboard', () => {
  it('should return dashboard data', () => {
    const { result } = renderHook(() => useDashboard());
    expect(result.current.metrics).toBeDefined();
    expect(result.current.refresh).toBeDefined();
  });
});