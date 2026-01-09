import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useDialog } from '../useDialog';
describe('useDialog', () => { it('should manage dialog state', () => { const { result } = renderHook(() => useDialog()); expect(result.current.isOpen).toBe(false); }); });