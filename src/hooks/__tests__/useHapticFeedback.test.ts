import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useHapticFeedback } from '../useHapticFeedback';
describe('useHapticFeedback', () => { it('should provide haptic feedback', () => { const { result } = renderHook(() => useHapticFeedback()); expect(typeof result.current.trigger).toBe('function'); }); });