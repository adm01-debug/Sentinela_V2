import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useModal } from '../useModal';

describe('useModal', () => {
  it('should initialize as closed', () => {
    const { result } = renderHook(() => useModal());
    expect(result.current.isOpen).toBe(false);
  });

  it('should open modal', () => {
    const { result } = renderHook(() => useModal());
    act(() => { result.current.open(); });
    expect(result.current.isOpen).toBe(true);
  });

  it('should close modal', () => {
    const { result } = renderHook(() => useModal(true));
    act(() => { result.current.close(); });
    expect(result.current.isOpen).toBe(false);
  });

  it('should toggle modal', () => {
    const { result } = renderHook(() => useModal());
    act(() => { result.current.toggle(); });
    expect(result.current.isOpen).toBe(true);
  });
});