// Selection Store Tests for Sentinela v17
import { describe, it, expect, beforeEach } from 'vitest';
import { useSelectionStore } from '../selectionStore';

describe('selectionStore', () => {
  beforeEach(() => {
    useSelectionStore.getState().reset();
  });

  it('should have correct initial state', () => {
    const state = useSelectionStore.getState();
    expect(state.selectedIds.size).toBe(0);
    expect(state.lastSelectedId).toBeNull();
    expect(state.anchorId).toBeNull();
    expect(state.isSelectMode).toBe(false);
  });

  it('should select and deselect items', () => {
    const store = useSelectionStore.getState();
    store.select('item-1');
    expect(useSelectionStore.getState().selectedIds.has('item-1')).toBe(true);
    store.deselect('item-1');
    expect(useSelectionStore.getState().selectedIds.has('item-1')).toBe(false);
  });

  it('should toggle selection', () => {
    const { toggle } = useSelectionStore.getState();
    toggle('item-1');
    expect(useSelectionStore.getState().selectedIds.has('item-1')).toBe(true);
    toggle('item-1');
    expect(useSelectionStore.getState().selectedIds.has('item-1')).toBe(false);
  });

  it('should select multiple items', () => {
    const { selectMultiple } = useSelectionStore.getState();
    selectMultiple(['item-1', 'item-2', 'item-3']);
    expect(useSelectionStore.getState().selectedIds.size).toBe(3);
  });

  it('should select all and deselect all', () => {
    const store = useSelectionStore.getState();
    store.selectAll(['a', 'b', 'c']);
    expect(useSelectionStore.getState().selectedIds.size).toBe(3);
    store.deselectAll();
    expect(useSelectionStore.getState().selectedIds.size).toBe(0);
  });

  it('should select range', () => {
    const { selectRange } = useSelectionStore.getState();
    const allIds = ['a', 'b', 'c', 'd', 'e'];
    selectRange('b', 'd', allIds);
    const selected = useSelectionStore.getState().selectedIds;
    expect(selected.has('b')).toBe(true);
    expect(selected.has('c')).toBe(true);
    expect(selected.has('d')).toBe(true);
    expect(selected.has('a')).toBe(false);
  });

  it('should track last selected id', () => {
    const { select } = useSelectionStore.getState();
    select('item-1');
    expect(useSelectionStore.getState().lastSelectedId).toBe('item-1');
    select('item-2');
    expect(useSelectionStore.getState().lastSelectedId).toBe('item-2');
  });

  it('should get selected array', () => {
    const store = useSelectionStore.getState();
    store.selectMultiple(['a', 'b']);
    expect(store.getSelectedArray()).toContain('a');
    expect(store.getSelectedArray()).toContain('b');
  });

  it('should get selected count', () => {
    const store = useSelectionStore.getState();
    store.selectMultiple(['a', 'b', 'c']);
    expect(store.getSelectedCount()).toBe(3);
  });
});
