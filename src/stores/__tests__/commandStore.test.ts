// Command Store Tests for Sentinela v17
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useCommandStore } from '../commandStore';

describe('commandStore', () => {
  beforeEach(() => {
    useCommandStore.getState().reset();
  });

  it('should have correct initial state', () => {
    const state = useCommandStore.getState();
    expect(state.isOpen).toBe(false);
    expect(state.query).toBe('');
    expect(state.groups).toEqual([]);
    expect(state.selectedIndex).toBe(0);
    expect(state.isLoading).toBe(false);
  });

  it('should open and close', () => {
    const store = useCommandStore.getState();
    store.open();
    expect(useCommandStore.getState().isOpen).toBe(true);
    store.close();
    expect(useCommandStore.getState().isOpen).toBe(false);
  });

  it('should toggle', () => {
    const { toggle } = useCommandStore.getState();
    toggle();
    expect(useCommandStore.getState().isOpen).toBe(true);
    toggle();
    expect(useCommandStore.getState().isOpen).toBe(false);
  });

  it('should set and clear query', () => {
    const store = useCommandStore.getState();
    store.setQuery('test');
    expect(useCommandStore.getState().query).toBe('test');
    store.clearQuery();
    expect(useCommandStore.getState().query).toBe('');
  });

  it('should register and unregister group', () => {
    const store = useCommandStore.getState();
    const group = { id: 'nav', label: 'Navigation', commands: [], priority: 1 };
    store.registerGroup(group);
    expect(useCommandStore.getState().groups).toHaveLength(1);
    store.unregisterGroup('nav');
    expect(useCommandStore.getState().groups).toHaveLength(0);
  });

  it('should register command to group', () => {
    const store = useCommandStore.getState();
    store.registerGroup({ id: 'nav', label: 'Navigation', commands: [] });
    store.registerCommand('nav', { id: 'home', label: 'Go Home', action: vi.fn() });
    expect(useCommandStore.getState().groups[0].commands).toHaveLength(1);
  });

  it('should add to recent commands', () => {
    const { addToRecent } = useCommandStore.getState();
    addToRecent('cmd-1');
    addToRecent('cmd-2');
    expect(useCommandStore.getState().recentCommands).toEqual(['cmd-2', 'cmd-1']);
  });

  it('should navigate selection', () => {
    const store = useCommandStore.getState();
    store.registerGroup({
      id: 'test',
      label: 'Test',
      commands: [
        { id: '1', label: '1', action: vi.fn() },
        { id: '2', label: '2', action: vi.fn() },
      ],
    });
    store.selectNext();
    expect(useCommandStore.getState().selectedIndex).toBe(1);
    store.selectPrevious();
    expect(useCommandStore.getState().selectedIndex).toBe(0);
  });
});
