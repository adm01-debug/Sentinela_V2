import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useStep } from '../useStep';
describe('useStep', () => { it('should manage steps', () => { const { result } = renderHook(() => useStep(5)); expect(result.current.currentStep).toBe(0); act(() => { result.current.nextStep(); }); expect(result.current.currentStep).toBe(1); }); });