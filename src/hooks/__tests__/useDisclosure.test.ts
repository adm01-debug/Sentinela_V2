import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useDisclosure } from '../useDisclosure';

describe('useDisclosure', () => {
  it('should open', () => {
    const { result } = renderHook(() => useDisclosure());
    act(() => { result.current.open(); });
    expect(result.current.isOpen).toBe(true);
  });

  it('should close', () => {
    const { result } = renderHook(() => useDisclosure(true));
    act(() => { result.current.close(); });
    expect(result.current.isOpen).toBe(false);
  });

  it('should toggle', () => {
    const { result } = renderHook(() => useDisclosure());
    act(() => { result.current.toggle(); });
    expect(result.current.isOpen).toBe(true);
  });
});