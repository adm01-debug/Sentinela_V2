import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useMultiStepWizard } from '../useMultiStepWizard';
describe('useMultiStepWizard', () => { it('should manage wizard', () => { const steps = ['a', 'b', 'c']; const { result } = renderHook(() => useMultiStepWizard(steps)); expect(result.current.currentStep).toBe(0); }); });