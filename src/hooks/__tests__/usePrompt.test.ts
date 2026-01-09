import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { usePrompt } from '../usePrompt';

describe('usePrompt', () => {
  it('should show prompt', () => {
    const { result } = renderHook(() => usePrompt());
    act(() => { result.current.prompt({ message: 'Enter value' }); });
    expect(result.current.isOpen).toBe(true);
  });
});