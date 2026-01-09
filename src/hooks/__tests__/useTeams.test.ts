import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useTeams } from '../useTeams';

describe('useTeams', () => {
  it('should manage teams', () => {
    const { result } = renderHook(() => useTeams());
    expect(result.current.teams).toBeDefined();
    expect(result.current.create).toBeDefined();
  });
});