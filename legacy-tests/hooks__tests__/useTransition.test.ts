import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useTransition } from '../useTransition';

describe('useTransition', () => {
  it('works', () => {
    const { result } = renderHook(() => useTransition());
    expect(result.current).toBeDefined();
  });
});