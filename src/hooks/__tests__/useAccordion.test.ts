import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useAccordion } from '../useAccordion';
describe('useAccordion', () => { it('should manage accordion', () => { const { result } = renderHook(() => useAccordion()); expect(result.current.expandedItems).toEqual([]); }); });