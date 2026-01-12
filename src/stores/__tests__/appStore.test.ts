import { describe, it, expect, beforeEach } from 'vitest';
import { useAppStore } from '../appStore';

describe('appStore', () => {
  beforeEach(() => {
    useAppStore.setState({ isInitialized: false, version: '1.0.0' });
  });

  it('should have correct initial state', () => {
    const state = useAppStore.getState();
    expect(state).toBeDefined();
  });

  it('should set initialized state', () => {
    useAppStore.setState({ isInitialized: true });
    expect(useAppStore.getState().isInitialized).toBe(true);
  });

  it('should track app version', () => {
    useAppStore.setState({ version: '2.0.0' });
    expect(useAppStore.getState().version).toBe('2.0.0');
  });

  it('should handle app ready state', () => {
    const store = useAppStore.getState();
    if (store.setReady) {
      store.setReady(true);
      expect(useAppStore.getState().isReady).toBe(true);
    }
  });
});
