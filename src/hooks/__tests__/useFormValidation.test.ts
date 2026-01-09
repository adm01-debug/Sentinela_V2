import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useFormValidation } from '../useFormValidation';

describe('useFormValidation', () => {
  it('should validate required field', () => {
    const { result } = renderHook(() => useFormValidation({ name: { required: true } }));
    act(() => { result.current.validate({ name: '' }); });
    expect(result.current.errors.name).toBeDefined();
  });

  it('should pass validation', () => {
    const { result } = renderHook(() => useFormValidation({ name: { required: true } }));
    act(() => { result.current.validate({ name: 'John' }); });
    expect(result.current.errors.name).toBeUndefined();
  });

  it('should validate email format', () => {
    const { result } = renderHook(() => useFormValidation({ email: { email: true } }));
    act(() => { result.current.validate({ email: 'invalid' }); });
    expect(result.current.errors.email).toBeDefined();
  });
});