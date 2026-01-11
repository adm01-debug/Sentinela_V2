// Search Store Tests for Sentinela v17
import { describe, it, expect, beforeEach } from 'vitest';
import { useSearchStore, selectGroupedResults } from '../searchStore';

describe('searchStore', () => {
  beforeEach(() => {
    useSearchStore.getState().reset();
  });

  it('should initialize with closed state', () => {
    const state = useSearchStore.getState();
    expect(state.isOpen).toBe(false);
    expect(state.query).toBe('');
    expect(state.results).toEqual([]);
  });

  it('should open and close search', () => {
    useSearchStore.getState().open();
    expect(useSearchStore.getState().isOpen).toBe(true);
    useSearchStore.getState().close();
    expect(useSearchStore.getState().isOpen).toBe(false);
  });

  it('should toggle search', () => {
    useSearchStore.getState().toggle();
    expect(useSearchStore.getState().isOpen).toBe(true);
    useSearchStore.getState().toggle();
    expect(useSearchStore.getState().isOpen).toBe(false);
  });

  it('should set and clear query', () => {
    useSearchStore.getState().setQuery('test query');
    expect(useSearchStore.getState().query).toBe('test query');
    useSearchStore.getState().clearQuery();
    expect(useSearchStore.getState().query).toBe('');
  });

  it('should set results', () => {
    const results = [
      { id: '1', type: 'employee' as const, title: 'John', score: 1 },
      { id: '2', type: 'team' as const, title: 'Dev Team', score: 0.9 },
    ];
    useSearchStore.getState().setResults(results);
    expect(useSearchStore.getState().results).toHaveLength(2);
  });

  it('should add to recent searches', () => {
    useSearchStore.getState().addRecentSearch('query 1');
    useSearchStore.getState().addRecentSearch('query 2');
    expect(useSearchStore.getState().recentSearches).toContain('query 1');
    expect(useSearchStore.getState().recentSearches[0]).toBe('query 2');
  });

  it('should clear recent searches', () => {
    useSearchStore.getState().addRecentSearch('test');
    useSearchStore.getState().clearRecentSearches();
    expect(useSearchStore.getState().recentSearches).toEqual([]);
  });

  it('should set filters', () => {
    useSearchStore.getState().setFilters({ types: ['employee', 'team'] });
    expect(useSearchStore.getState().filters.types).toEqual(['employee', 'team']);
  });

  it('should navigate results', () => {
    const results = [
      { id: '1', type: 'employee' as const, title: 'A', score: 1 },
      { id: '2', type: 'employee' as const, title: 'B', score: 1 },
    ];
    useSearchStore.getState().setResults(results);
    useSearchStore.getState().selectNext();
    expect(useSearchStore.getState().selectedIndex).toBe(1);
    useSearchStore.getState().selectPrevious();
    expect(useSearchStore.getState().selectedIndex).toBe(0);
  });

  it('should group results by type', () => {
    const results = [
      { id: '1', type: 'employee' as const, title: 'A', score: 1 },
      { id: '2', type: 'team' as const, title: 'B', score: 1 },
    ];
    useSearchStore.getState().setResults(results);
    const grouped = selectGroupedResults(useSearchStore.getState());
    expect(grouped).toHaveLength(2);
  });
});
