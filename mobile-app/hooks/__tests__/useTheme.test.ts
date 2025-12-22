import { renderHook } from '@testing-library/react-hooks';
import { describe, it, expect } from 'vitest';
import { useTheme } from '../useTheme';

describe('useTheme', () => {
  it('returns value', () => {
    const { result } = renderHook(() => useTheme());
    expect(result.current).toBeDefined();
  });
});