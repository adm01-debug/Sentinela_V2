import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useWorkHours } from '../useWorkHours';

describe('useWorkHours', () => {
  it('should track work hours', () => {
    const { result } = renderHook(() => useWorkHours());
    expect(result.current.hours).toBeDefined();
    expect(result.current.overtime).toBeDefined();
  });
});