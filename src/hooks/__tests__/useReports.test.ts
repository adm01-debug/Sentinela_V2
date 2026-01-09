import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useReports } from '../useReports';

describe('useReports', () => {
  it('should manage reports', () => {
    const { result } = renderHook(() => useReports());
    expect(result.current.generate).toBeDefined();
    expect(result.current.reports).toBeDefined();
  });
});