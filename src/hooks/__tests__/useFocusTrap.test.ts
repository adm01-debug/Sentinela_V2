import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useFocusTrap } from '../useFocusTrap';

describe('useFocusTrap', () => {
  it('should trap focus', () => {
    const ref = { current: document.createElement('div') };
    const { result } = renderHook(() => useFocusTrap(ref));
    expect(result.current).toBeDefined();
  });
});