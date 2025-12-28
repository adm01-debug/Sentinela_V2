import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useFirstMountState } from '../useFirstMountState';

describe('useFirstMountState', () => {
  it('works', () => {
    const { result } = renderHook(() => useFirstMountState());
    expect(result.current).toBeDefined();
  });
});