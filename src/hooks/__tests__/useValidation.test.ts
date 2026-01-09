import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useValidation } from '../useValidation';

describe('useValidation', () => {
  it('should validate data', () => {
    const schema = { name: { required: true } };
    const { result } = renderHook(() => useValidation(schema));
    act(() => { result.current.validate({ name: '' }); });
    expect(result.current.errors.name).toBeDefined();
  });
});