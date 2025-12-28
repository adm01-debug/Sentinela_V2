import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { usePermission } from '../usePermission';

describe('usePermission', () => {
  it('works', () => {
    const { result } = renderHook(() => usePermission());
    expect(result.current).toBeDefined();
  });
});