import { renderHook, act } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import { useExport } from '../useExport';

describe('useExport', () => {
  it('should provide exportToCSV function', () => {
    const { result } = renderHook(() => useExport());
    expect(result.current.exportToCSV).toBeDefined();
  });
  it('should provide exportToExcel function', () => {
    const { result } = renderHook(() => useExport());
    expect(result.current.exportToExcel).toBeDefined();
  });
  it('should provide exportToPDF function', () => {
    const { result } = renderHook(() => useExport());
    expect(result.current.exportToPDF).toBeDefined();
  });
  it('should track exporting state', () => {
    const { result } = renderHook(() => useExport());
    expect(result.current.isExporting).toBe(false);
  });
});
