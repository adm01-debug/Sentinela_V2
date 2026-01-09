import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useViolationRules } from '../useViolationRules';
describe('useViolationRules', () => { it('should fetch rules', () => { const { result } = renderHook(() => useViolationRules()); expect(result.current).toBeDefined(); }); });