import { describe, it, expect } from 'vitest';
import { useTeamStore } from '../teamStore';

describe('teamStore', () => {
  it('should have initial state', () => {
    const store = useTeamStore.getState();
    expect(store).toBeDefined();
  });
});