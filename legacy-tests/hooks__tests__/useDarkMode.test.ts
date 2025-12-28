import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useDarkMode } from '../useDarkMode';

describe('useDarkMode', () => {
  it('initializes correctly', () => {
    const { result } = renderHook(() => useDarkMode());
    expect(result.current).toBeDefined();
  });
});