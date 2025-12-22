import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useClickOutside } from '../useClickOutside';

describe('useClickOutside', () => {
  it('initializes correctly', () => {
    const { result } = renderHook(() => useClickOutside());
    expect(result.current).toBeDefined();
  });
});