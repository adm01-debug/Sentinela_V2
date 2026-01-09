import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useConfirm } from '../useConfirm';
describe('useConfirm', () => { it('should manage confirm dialog', () => { const { result } = renderHook(() => useConfirm()); expect(result.current.isOpen).toBe(false); act(() => { result.current.confirm('Are you sure?'); }); }); });