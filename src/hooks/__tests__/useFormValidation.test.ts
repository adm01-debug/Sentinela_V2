import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useFormValidation } from '../useFormValidation';
describe('useFormValidation', () => { it('should validate form', () => { const { result } = renderHook(() => useFormValidation({ email: '' }, { email: (v) => !v ? 'Required' : null })); expect(result.current.errors).toBeDefined(); }); });