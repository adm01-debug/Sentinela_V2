import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useTabs } from '../useTabs';
describe('useTabs', () => { it('should manage tabs', () => { const { result } = renderHook(() => useTabs(['a', 'b'])); expect(result.current.activeTab).toBe('a'); act(() => { result.current.setTab('b'); }); expect(result.current.activeTab).toBe('b'); }); });