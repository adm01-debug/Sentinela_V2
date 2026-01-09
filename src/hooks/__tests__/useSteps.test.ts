import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useSteps } from '../useSteps';

describe('useSteps', () => {
  it('should initialize at step 0', () => {
    const { result } = renderHook(() => useSteps(5));
    expect(result.current.currentStep).toBe(0);
  });

  it('should go to next step', () => {
    const { result } = renderHook(() => useSteps(5));
    act(() => { result.current.nextStep(); });
    expect(result.current.currentStep).toBe(1);
  });

  it('should go to previous step', () => {
    const { result } = renderHook(() => useSteps(5, 2));
    act(() => { result.current.prevStep(); });
    expect(result.current.currentStep).toBe(1);
  });

  it('should not exceed max', () => {
    const { result } = renderHook(() => useSteps(3, 2));
    act(() => { result.current.nextStep(); });
    expect(result.current.currentStep).toBe(2);
  });
});