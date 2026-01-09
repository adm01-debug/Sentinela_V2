import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useForm } from '../useForm';
describe('useForm', () => { it('should manage form state', () => { const { result } = renderHook(() => useForm({ name: '' })); act(() => { result.current.setValue('name', 'test'); }); expect(result.current.values.name).toBe('test'); }); });