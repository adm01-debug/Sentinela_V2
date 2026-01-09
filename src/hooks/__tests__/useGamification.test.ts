import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useGamification } from '../useGamification';

describe('useGamification', () => {
  it('should manage gamification', () => {
    const { result } = renderHook(() => useGamification());
    expect(result.current.points).toBeDefined();
    expect(result.current.badges).toBeDefined();
    expect(result.current.leaderboard).toBeDefined();
  });
});