import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useTenant } from '../useTenant';

describe('useTenant', () => {
  it('should return tenant info', () => {
    const { result } = renderHook(() => useTenant());
    expect(result.current.tenant).toBeDefined();
  });
});