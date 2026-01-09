import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useMeasure } from '../useMeasure';

describe('useMeasure', () => {
  it('should measure element', () => {
    const ref = { current: document.createElement('div') };
    const { result } = renderHook(() => useMeasure(ref));
    expect(result.current.width).toBeDefined();
  });
});