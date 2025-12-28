import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { usePopover } from '../usePopover';

describe('usePopover', () => {
  it('works', () => {
    const { result } = renderHook(() => usePopover());
    expect(result.current).toBeDefined();
  });
});