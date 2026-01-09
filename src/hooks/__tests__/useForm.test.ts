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
    act(() => { result.current.setField('name', 'John'); });
    expect(result.current.values.name).toBe('John');
  });

  it('should reset form', () => {
    const { result } = renderHook(() => useForm({ name: '' }));
    act(() => { result.current.setField('name', 'John'); result.current.reset(); });
    expect(result.current.values.name).toBe('');
  });

  it('should track dirty state', () => {
    const { result } = renderHook(() => useForm({ name: '' }));
    expect(result.current.isDirty).toBe(false);
    act(() => { result.current.setField('name', 'John'); });
    expect(result.current.isDirty).toBe(true);
  });
});