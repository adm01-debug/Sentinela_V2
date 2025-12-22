import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useTooltip } from '../useTooltip';

describe('useTooltip', () => {
  it('works', () => {
    const { result } = renderHook(() => useTooltip());
    expect(result.current).toBeDefined();
  });
});