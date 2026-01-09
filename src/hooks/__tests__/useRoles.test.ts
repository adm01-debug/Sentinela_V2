import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useRoles } from '../useRoles';

describe('useRoles', () => {
  it('should check user roles', () => {
    const { result } = renderHook(() => useRoles());
    expect(result.current.roles).toBeDefined();
  });

  it('should verify role', () => {
    const { result } = renderHook(() => useRoles());
    expect(typeof result.current.hasRole).toBe('function');
  });
});