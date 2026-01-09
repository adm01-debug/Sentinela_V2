import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { usePerformanceMonitor } from '../usePerformanceMonitor';
describe('usePerformanceMonitor', () => { it('should monitor performance', () => { const { result } = renderHook(() => usePerformanceMonitor()); expect(result.current).toBeDefined(); }); });