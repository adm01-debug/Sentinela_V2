import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useScheduledReports } from '../useScheduledReports';
describe('useScheduledReports', () => { it('should fetch reports', () => { const { result } = renderHook(() => useScheduledReports()); expect(result.current).toBeDefined(); }); });