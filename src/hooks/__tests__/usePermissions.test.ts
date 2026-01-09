import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { usePermissions } from '../usePermissions';

describe('usePermissions', () => {
  it('should check user permissions', () => {
    const { result } = renderHook(() => usePermissions(['read', 'write']));
    expect(result.current.hasPermission).toBeDefined();
  });

  it('should validate permission', () => {
    const { result } = renderHook(() => usePermissions(['admin']));
    expect(typeof result.current.can).toBe('function');
  });
});