import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { usePortal } from '../usePortal';

describe('usePortal', () => {
  it('works', () => {
    const { result } = renderHook(() => usePortal());
    expect(result.current).toBeDefined();
  });
});