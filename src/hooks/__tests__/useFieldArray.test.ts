import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useFieldArray } from '../useFieldArray';
describe('useFieldArray', () => { it('should manage field array', () => { const { result } = renderHook(() => useFieldArray([])); act(() => { result.current.append({ id: 1 }); }); expect(result.current.fields.length).toBe(1); }); });