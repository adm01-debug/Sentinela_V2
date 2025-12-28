import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useDropdown } from '../useDropdown';

describe('useDropdown', () => {
  it('initializes correctly', () => {
    const { result } = renderHook(() => useDropdown());
    expect(result.current).toBeDefined();
  });
});