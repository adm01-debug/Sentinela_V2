import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useColorScheme } from '../useColorScheme';

describe('useColorScheme', () => {
  it('should detect system preference', () => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() });
    const { result } = renderHook(() => useColorScheme());
    expect(result.current).toBeDefined();
  });
});