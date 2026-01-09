import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useDoubleClick } from '../useDoubleClick';

describe('useDoubleClick', () => {
  it('should handle double click', () => {
    const onDoubleClick = vi.fn();
    const { result } = renderHook(() => useDoubleClick({ onDoubleClick }));
    act(() => { result.current.onClick(); result.current.onClick(); });
  });
});