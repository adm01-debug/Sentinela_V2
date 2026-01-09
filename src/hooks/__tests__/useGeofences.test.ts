import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useGeofences } from '../useGeofences';
describe('useGeofences', () => { it('should fetch geofences', () => { const { result } = renderHook(() => useGeofences()); expect(result.current).toBeDefined(); }); });