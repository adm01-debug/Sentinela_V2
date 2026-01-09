import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useClipboard } from '../useClipboard';
describe('useClipboard', () => {
  it('should provide clipboard functions', () => {
    const { result } = renderHook(() => useClipboard());
    expect(typeof result.current.copy).toBe('function');
  });
});