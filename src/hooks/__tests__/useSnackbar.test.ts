import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useSnackbar } from '../useSnackbar';

describe('useSnackbar', () => {
  it('should show snackbar', () => {
    const { result } = renderHook(() => useSnackbar());
    act(() => { result.current.show('Message'); });
    expect(result.current.message).toBe('Message');
    expect(result.current.isVisible).toBe(true);
  });

  it('should hide snackbar', () => {
    const { result } = renderHook(() => useSnackbar());
    act(() => { result.current.show('Msg'); result.current.hide(); });
    expect(result.current.isVisible).toBe(false);
  });
});