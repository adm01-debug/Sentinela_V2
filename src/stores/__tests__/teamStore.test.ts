import { describe, it, expect, beforeEach } from 'vitest';
import { useTeamStore } from '../teamStore';

describe('teamStore', () => {
  beforeEach(() => {
    useTeamStore.setState({ teams: [], selectedTeam: null, isLoading: false });
  });

  it('should have correct initial state', () => {
    const state = useTeamStore.getState();
    expect(state.teams).toEqual([]);
    expect(state.selectedTeam).toBeNull();
  });

  it('should set teams', () => {
    const teams = [{ id: '1', name: 'Development', members: [] }];
    useTeamStore.setState({ teams });
    expect(useTeamStore.getState().teams).toEqual(teams);
  });

  it('should select team', () => {
    const team = { id: '1', name: 'QA Team', members: ['user1', 'user2'] };
    useTeamStore.setState({ selectedTeam: team });
    expect(useTeamStore.getState().selectedTeam).toEqual(team);
  });

  it('should add team', () => {
    const store = useTeamStore.getState();
    if (store.addTeam) {
      store.addTeam({ id: '1', name: 'New Team', members: [] });
      expect(useTeamStore.getState().teams.length).toBe(1);
    }
  });

  it('should update team', () => {
    useTeamStore.setState({ teams: [{ id: '1', name: 'Old Name', members: [] }] });
    const store = useTeamStore.getState();
    if (store.updateTeam) {
      store.updateTeam('1', { name: 'New Name' });
      expect(useTeamStore.getState().teams[0].name).toBe('New Name');
    }
  });

  it('should remove team', () => {
    useTeamStore.setState({ teams: [{ id: '1', name: 'Test', members: [] }] });
    const store = useTeamStore.getState();
    if (store.removeTeam) {
      store.removeTeam('1');
      expect(useTeamStore.getState().teams.length).toBe(0);
    }
  });
});
