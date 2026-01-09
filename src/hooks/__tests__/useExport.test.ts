import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useExport } from '../useExport';

describe('useExport', () => {
  it('should export data', async () => {
    const { result } = renderHook(() => useExport());
    expect(typeof result.current.exportCSV).toBe('function');
    expect(typeof result.current.exportPDF).toBe('function');
  });
});