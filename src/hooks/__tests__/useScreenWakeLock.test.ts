import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useScreenWakeLock } from '../useScreenWakeLock';
describe('useScreenWakeLock', () => { it('should manage wake lock', () => { const { result } = renderHook(() => useScreenWakeLock()); expect(result.current).toBeDefined(); }); });