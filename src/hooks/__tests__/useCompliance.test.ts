import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useCompliance } from '../useCompliance';

describe('useCompliance', () => {
  it('should check compliance', () => {
    const { result } = renderHook(() => useCompliance());
    expect(result.current.status).toBeDefined();
    expect(result.current.issues).toBeDefined();
  });
});