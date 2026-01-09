import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useSchedule } from '../useSchedule';

describe('useSchedule', () => {
  it('should manage schedules', () => {
    const { result } = renderHook(() => useSchedule());
    expect(result.current.schedules).toBeDefined();
    expect(typeof result.current.create).toBe('function');
  });
});