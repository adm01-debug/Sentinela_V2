import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useDropdown } from '../useDropdown';

describe('useDropdown', () => {
  it('should toggle dropdown', () => {
    const { result } = renderHook(() => useDropdown());
    expect(result.current.isOpen).toBe(false);
    act(() => { result.current.toggle(); });
    expect(result.current.isOpen).toBe(true);
  });
});