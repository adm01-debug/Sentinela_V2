import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useTasks } from '../useTasks';

describe('useTasks', () => {
  it('should manage tasks', () => {
    const { result } = renderHook(() => useTasks());
    expect(result.current.tasks).toBeDefined();
    act(() => { result.current.add({ title: 'Test' }); });
  });
});