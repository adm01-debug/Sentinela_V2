import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useModal } from '../useModal';

describe('useModal', () => {
  it('should open modal', () => {
    const { result } = renderHook(() => useModal());
    act(() => { result.current.openModal(); });
    expect(result.current.isOpen).toBe(true);
  });

  it('should close modal', () => {
    const { result } = renderHook(() => useModal());
    act(() => { result.current.openModal(); });
    act(() => { result.current.closeModal(); });
    expect(result.current.isOpen).toBe(false);
  });
});