import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useNavigation } from '../useNavigation';

describe('useNavigation', () => {
  it('should manage navigation', () => {
    const { result } = renderHook(() => useNavigation());
    expect(typeof result.current.navigate).toBe('function');
    expect(typeof result.current.goBack).toBe('function');
  });
});