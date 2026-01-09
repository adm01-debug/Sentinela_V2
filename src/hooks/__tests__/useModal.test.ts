import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useModal } from '../useModal';
describe('useModal', () => { it('should manage modal state', () => { const { result } = renderHook(() => useModal()); expect(result.current.isOpen).toBe(false); act(() => { result.current.open(); }); expect(result.current.isOpen).toBe(true); }); });