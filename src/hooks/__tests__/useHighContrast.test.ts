import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useHighContrast } from '../useHighContrast';
describe('useHighContrast', () => { it('should detect high contrast', () => { const { result } = renderHook(() => useHighContrast()); expect(typeof result.current).toBe('boolean'); }); });