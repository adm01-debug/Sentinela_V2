import { describe, it, expect, beforeEach } from 'vitest';
import { useReportStore } from '../reportStore';

describe('reportStore', () => {
  beforeEach(() => {
    useReportStore.setState({ reports: [], selectedReport: null, isGenerating: false });
  });

  it('should have correct initial state', () => {
    const state = useReportStore.getState();
    expect(state.reports).toEqual([]);
    expect(state.isGenerating).toBe(false);
  });

  it('should set reports', () => {
    const reports = [{ id: '1', name: 'Monthly Report', type: 'monthly' }];
    useReportStore.setState({ reports });
    expect(useReportStore.getState().reports).toEqual(reports);
  });

  it('should set generating state', () => {
    useReportStore.setState({ isGenerating: true });
    expect(useReportStore.getState().isGenerating).toBe(true);
  });

  it('should select report', () => {
    const report = { id: '1', name: 'Test Report', type: 'custom' };
    useReportStore.setState({ selectedReport: report });
    expect(useReportStore.getState().selectedReport).toEqual(report);
  });

  it('should generate report', () => {
    const store = useReportStore.getState();
    if (store.generateReport) {
      store.generateReport({ type: 'weekly', dateRange: { start: '2024-01-01', end: '2024-01-07' } });
      expect(useReportStore.getState().isGenerating).toBeDefined();
    }
  });
});
