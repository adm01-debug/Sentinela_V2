import { useState, useCallback } from 'react';

export function useExport() {
  const [exporting, setExporting] = useState(false);

  const exportCsv = useCallback((data: any[], filename: string) => {
    setExporting(true);
    const headers = Object.keys(data[0] || {});
    const csv = [headers.join(','), ...data.map(row => headers.map(h => JSON.stringify(row[h] ?? '')).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename + '.csv';
    a.click();
    URL.revokeObjectURL(url);
    setExporting(false);
  }, []);

  const exportJson = useCallback((data: any, filename: string) => {
    setExporting(true);
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename + '.json';
    a.click();
    URL.revokeObjectURL(url);
    setExporting(false);
  }, []);

  return { exporting, exportCsv, exportJson };
}
