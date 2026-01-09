import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useRules } from '../useRules';

describe('useRules', () => {
  it('should manage rules', () => {
    const { result } = renderHook(() => useRules());
    expect(result.current.rules).toBeDefined();
    expect(typeof result.current.create).toBe('function');
  });
});