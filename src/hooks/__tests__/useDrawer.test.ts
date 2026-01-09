import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useDrawer } from '../useDrawer';
describe('useDrawer', () => { it('should manage drawer state', () => { const { result } = renderHook(() => useDrawer()); expect(result.current.isOpen).toBe(false); act(() => { result.current.open(); }); expect(result.current.isOpen).toBe(true); }); });