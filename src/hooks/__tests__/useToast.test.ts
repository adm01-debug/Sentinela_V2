import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useToast } from '../useToast';
describe('useToast', () => { it('should manage toasts', () => { const { result } = renderHook(() => useToast()); expect(result.current.toasts).toEqual([]); act(() => { result.current.toast({ title: 'Test' }); }); }); });