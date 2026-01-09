import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useKeyPress } from '../useKeyPress';

describe('useKeyPress', () => {
  it('should detect key press', () => {
    const { result } = renderHook(() => useKeyPress('Enter'));
    expect(result.current).toBe(false);
    act(() => { document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' })); });
    expect(result.current).toBe(true);
  });

  it('should detect key release', () => {
    const { result } = renderHook(() => useKeyPress('Enter'));
    act(() => { document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' })); });
    act(() => { document.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter' })); });
    expect(result.current).toBe(false);
  });
});