// Analytics Store Tests for Sentinela v17
import { describe, it, expect, beforeEach } from 'vitest';
import { useAnalyticsStore } from '../analyticsStore';

describe('analyticsStore', () => {
  beforeEach(() => {
    useAnalyticsStore.getState().reset();
  });

  it('should have correct initial state', () => {
    const state = useAnalyticsStore.getState();
    expect(state.data).toBeNull();
    expect(state.selectedMetrics).toContain('productivity');
    expect(state.groupBy).toBe('day');
    expect(state.compareMode).toBe(false);
    expect(state.isLoading).toBe(false);
  });

  it('should set date range', () => {
    const { setDateRange } = useAnalyticsStore.getState();
    setDateRange({ start: '2024-01-01', end: '2024-01-31' });
    expect(useAnalyticsStore.getState().dateRange).toEqual({
      start: '2024-01-01',
      end: '2024-01-31',
    });
  });

  it('should set selected metrics', () => {
    const { setSelectedMetrics } = useAnalyticsStore.getState();
    setSelectedMetrics(['productivity', 'activeTime']);
    expect(useAnalyticsStore.getState().selectedMetrics).toEqual(['productivity', 'activeTime']);
  });

  it('should set group by', () => {
    const { setGroupBy } = useAnalyticsStore.getState();
    setGroupBy('week');
    expect(useAnalyticsStore.getState().groupBy).toBe('week');
  });

  it('should toggle compare mode', () => {
    const { setCompareMode } = useAnalyticsStore.getState();
    setCompareMode(true);
    expect(useAnalyticsStore.getState().compareMode).toBe(true);
  });

  it('should set loading state', () => {
    const { setLoading } = useAnalyticsStore.getState();
    setLoading(true);
    expect(useAnalyticsStore.getState().isLoading).toBe(true);
  });

  it('should set error', () => {
    const { setError } = useAnalyticsStore.getState();
    setError('Test error');
    expect(useAnalyticsStore.getState().error).toBe('Test error');
  });

  it('should reset to initial state', () => {
    const store = useAnalyticsStore.getState();
    store.setGroupBy('month');
    store.setCompareMode(true);
    store.reset();
    expect(useAnalyticsStore.getState().groupBy).toBe('day');
    expect(useAnalyticsStore.getState().compareMode).toBe(false);
  });
});
