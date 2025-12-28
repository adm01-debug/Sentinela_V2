import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useForm } from '../useForm';

describe('useForm', () => {
  it('works', () => {
    const { result } = renderHook(() => useForm());
    expect(result.current).toBeDefined();
  });
});