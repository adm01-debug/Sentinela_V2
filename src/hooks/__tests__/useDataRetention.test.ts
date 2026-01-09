import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useDataRetention } from '../useDataRetention';

describe('useDataRetention', () => {
  it('should manage data retention', () => {
    const { result } = renderHook(() => useDataRetention());
    expect(result.current.policy).toBeDefined();
    expect(typeof result.current.updatePolicy).toBe('function');
  });
});