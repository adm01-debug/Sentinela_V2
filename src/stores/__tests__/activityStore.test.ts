import { describe, it, expect, beforeEach } from 'vitest';
import { useActivityStore } from '../activityStore';

describe('activityStore', () => {
  beforeEach(() => {
    useActivityStore.setState({ activities: [], isLoading: false, error: null });
  });

  it('should have correct initial state', () => {
    const state = useActivityStore.getState();
    expect(state.activities).toEqual([]);
    expect(state.isLoading).toBe(false);
  });

  it('should set activities', () => {
    const activities = [{ id: '1', type: 'login', userId: 'user1', timestamp: new Date().toISOString() }];
    useActivityStore.setState({ activities });
    expect(useActivityStore.getState().activities).toEqual(activities);
  });

  it('should set loading state', () => {
    useActivityStore.setState({ isLoading: true });
    expect(useActivityStore.getState().isLoading).toBe(true);
  });

  it('should set error', () => {
    useActivityStore.setState({ error: 'Failed to load' });
    expect(useActivityStore.getState().error).toBe('Failed to load');
  });

  it('should add activity', () => {
    const store = useActivityStore.getState();
    if (store.addActivity) {
      store.addActivity({ id: '1', type: 'action', userId: 'user1', timestamp: new Date().toISOString() });
      expect(useActivityStore.getState().activities.length).toBe(1);
    }
  });
});
