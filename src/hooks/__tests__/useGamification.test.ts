import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useGamification } from '../useGamification';
describe('useGamification', () => { it('should fetch gamification', () => { const { result } = renderHook(() => useGamification()); expect(result.current).toBeDefined(); }); });