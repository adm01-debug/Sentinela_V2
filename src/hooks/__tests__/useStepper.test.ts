import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useStepper } from '../useStepper';

describe('useStepper', () => {
  const steps = ['Step 1', 'Step 2', 'Step 3'];

  it('should return current step label', () => {
    const { result } = renderHook(() => useStepper(steps));
    expect(result.current.currentStepLabel).toBe('Step 1');
  });

  it('should track completion', () => {
    const { result } = renderHook(() => useStepper(steps));
    expect(result.current.isFirst).toBe(true);
    expect(result.current.isLast).toBe(false);
  });
});