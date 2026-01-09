import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useCalendar } from '../useCalendar';

describe('useCalendar', () => {
  it('should manage calendar', () => {
    const { result } = renderHook(() => useCalendar());
    expect(result.current.events).toBeDefined();
    expect(result.current.currentDate).toBeDefined();
  });
});