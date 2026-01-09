import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useConfirm } from '../useConfirm';

describe('useConfirm', () => {
  it('should show confirm dialog', () => {
    const { result } = renderHook(() => useConfirm());
    act(() => { result.current.confirm({ message: 'Are you sure?' }); });
    expect(result.current.isOpen).toBe(true);
  });
});