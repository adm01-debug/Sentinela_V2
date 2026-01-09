import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useForm } from '../useForm';

describe('useForm', () => {
  it('should initialize with values', () => {
    const { result } = renderHook(() => useForm({ name: '', email: '' }));
    expect(result.current.values).toEqual({ name: '', email: '' });
  });

  it('should update field value', () => {
    const { result } = renderHook(() => useForm({ name: '' }));
    act(() => { result.current.handleChange({ target: { name: 'name', value: 'John' } }); });
    expect(result.current.values.name).toBe('John');
  });

  it('should reset form', () => {
    const { result } = renderHook(() => useForm({ name: 'John' }));
    act(() => { result.current.handleChange({ target: { name: 'name', value: 'Jane' } }); });
    act(() => { result.current.reset(); });
    expect(result.current.values.name).toBe('John');
  });

  it('should validate form', () => {
    const validate = (v: any) => v.name ? {} : { name: 'Required' };
    const { result } = renderHook(() => useForm({ name: '' }, validate));
    act(() => { result.current.handleSubmit({ preventDefault: () => {} }); });
    expect(result.current.errors.name).toBe('Required');
  });
});