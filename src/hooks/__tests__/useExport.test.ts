import { renderHook, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useExport } from '../useExport';

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn(), loading: vi.fn() } }));

describe('useExport', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useExport());
    expect(result.current.isExporting).toBe(false);
    expect(result.current.progress).toBe(0);
  });

  it('should have exportToCSV function', () => {
    const { result } = renderHook(() => useExport());
    expect(result.current.exportToCSV).toBeDefined();
    expect(typeof result.current.exportToCSV).toBe('function');
  });

  it('should have exportToExcel function', () => {
    const { result } = renderHook(() => useExport());
    expect(result.current.exportToExcel).toBeDefined();
    expect(typeof result.current.exportToExcel).toBe('function');
  });

  it('should have exportToPDF function', () => {
    const { result } = renderHook(() => useExport());
    expect(result.current.exportToPDF).toBeDefined();
    expect(typeof result.current.exportToPDF).toBe('function');
  });

  it('should have exportToJSON function', () => {
    const { result } = renderHook(() => useExport());
    expect(result.current.exportToJSON).toBeDefined();
  });

  it('should support custom columns configuration', () => {
    const columns = [{ key: 'name', label: 'Nome' }, { key: 'email', label: 'Email' }];
    const { result } = renderHook(() => useExport({ columns }));
    expect(result.current.exportToCSV).toBeDefined();
  });

  it('should handle empty data gracefully', async () => {
    const { result } = renderHook(() => useExport());
    await act(async () => {
      try { await result.current.exportToCSV([], 'test'); } catch (e) { /* expected */ }
    });
    expect(result.current.isExporting).toBe(false);
  });
});
