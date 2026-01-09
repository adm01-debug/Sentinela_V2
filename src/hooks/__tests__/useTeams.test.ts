import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useTeams } from '../useTeams';
describe('useTeams', () => { it('should fetch teams', () => { const { result } = renderHook(() => useTeams()); expect(result.current.teams).toBeDefined(); }); });