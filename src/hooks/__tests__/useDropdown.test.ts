import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useDropdown } from '../useDropdown';
describe('useDropdown', () => { it('should manage dropdown', () => { const { result } = renderHook(() => useDropdown()); expect(result.current.isOpen).toBe(false); }); });