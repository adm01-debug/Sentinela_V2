import { useCallback, useState } from 'react';

export type ExportFormat = 'png' | 'svg' | 'pdf' | 'csv';

export interface UseChartExportOptions {
  filename?: string;
  backgroundColor?: string;
  scale?: number;
}

export function useChartExport(options: UseChartExportOptions = {}) {
  const { filename = 'chart', backgroundColor = '#ffffff', scale = 2 } = options;
  const [isExporting, setIsExporting] = useState(false);

  const exportToPNG = useCallback(async (element: HTMLElement) => {
    setIsExporting(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(element, { backgroundColor, scale, useCORS: true });
      const link = document.createElement('a');
      link.download = `${filename}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } finally {
      setIsExporting(false);
    }
  }, [filename, backgroundColor, scale]);

  const exportToSVG = useCallback((svgElement: SVGElement) => {
    setIsExporting(true);
    try {
      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(svgElement);
      const blob = new Blob([svgString], { type: 'image/svg+xml' });
      const link = document.createElement('a');
      link.download = `${filename}.svg`;
      link.href = URL.createObjectURL(blob);
      link.click();
      URL.revokeObjectURL(link.href);
    } finally {
      setIsExporting(false);
    }
  }, [filename]);

  const exportToCSV = useCallback((data: Record<string, any>[], columns?: string[]) => {
    setIsExporting(true);
    try {
      const cols = columns || Object.keys(data[0] || {});
      const header = cols.join(',');
      const rows = data.map(row => cols.map(col => JSON.stringify(row[col] ?? '')).join(','));
      const csv = [header, ...rows].join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const link = document.createElement('a');
      link.download = `${filename}.csv`;
      link.href = URL.createObjectURL(blob);
      link.click();
      URL.revokeObjectURL(link.href);
    } finally {
      setIsExporting(false);
    }
  }, [filename]);

  return { exportToPNG, exportToSVG, exportToCSV, isExporting };
}

export default useChartExport;
