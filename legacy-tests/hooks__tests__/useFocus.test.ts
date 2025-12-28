import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useFocus } from '../useFocus';

describe('useFocus', () => {
  it('works', () => {
    const { result } = renderHook(() => useFocus());
    expect(result.current).toBeDefined();
  });
});