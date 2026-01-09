import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useDeviceOrientation } from '../useDeviceOrientation';
describe('useDeviceOrientation', () => { it('should track orientation', () => { const { result } = renderHook(() => useDeviceOrientation()); expect(result.current).toBeDefined(); }); });