import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useWorkSchedules } from '../useWorkSchedules';
describe('useWorkSchedules', () => { it('should fetch schedules', () => { const { result } = renderHook(() => useWorkSchedules()); expect(result.current).toBeDefined(); }); });