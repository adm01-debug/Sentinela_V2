import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useBattery } from '../useBattery';

describe('useBattery', () => {
  it('initializes correctly', () => {
    const { result } = renderHook(() => useBattery());
    expect(result.current).toBeDefined();
  });
});