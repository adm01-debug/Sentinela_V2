import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useTabs } from '../useTabs';

describe('useTabs', () => {
  it('works', () => {
    const { result } = renderHook(() => useTabs());
    expect(result.current).toBeDefined();
  });
});