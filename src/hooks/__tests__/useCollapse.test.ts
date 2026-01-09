import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useCollapse } from '../useCollapse';
describe('useCollapse', () => { it('should manage collapse', () => { const { result } = renderHook(() => useCollapse()); expect(result.current.isOpen).toBe(false); }); });