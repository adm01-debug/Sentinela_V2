import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { usePermission } from '../usePermission';
describe('usePermission', () => {
  it('should return permission state', () => {
    const { result } = renderHook(() => usePermission('geolocation'));
    expect(result.current).toBeDefined();
  });
});