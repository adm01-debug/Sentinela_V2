// ============================================================
// EXPORT HOOK
// Exportação de dados para CSV, Excel e PDF
// ============================================================

import { useState, useCallback } from 'react';
import { toast } from 'sonner';

// ============================================================
// TYPES
// ============================================================

export type ExportFormat = 'csv' | 'excel' | 'pdf' | 'json';

export interface ExportColumn<T> {
  key: keyof T | string;
  header: string;
  formatter?: (value: unknown, row: T) => string;
  width?: number; // For PDF
}

export interface ExportOptions<T> {
  filename?: string;
  columns?: ExportColumn<T>[];
  title?: string;
  subtitle?: string;
  includeTimestamp?: boolean;
}

export interface UseExportResult<T> {
  exportCSV: (data: T[], options?: ExportOptions<T>) => void;
  exportExcel: (data: T[], options?: ExportOptions<T>) => Promise<void>;
  exportPDF: (data: T[], options?: ExportOptions<T>) => Promise<void>;
  exportJSON: (data: T[], options?: ExportOptions<T>) => void;
  isExporting: boolean;
  error: Error | null;
}

// ============================================================
// HELPERS
// ============================================================

function getNestedValue(obj: unknown, path: string): unknown {
  return path.split('.').reduce((acc, part) => {
    if (acc && typeof acc === 'object') {
      return (acc as Record<string, unknown>)[part];
    }
    return undefined;
  }, obj as unknown);
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (value instanceof Date) return value.toLocaleDateString('pt-BR');
  if (typeof value === 'boolean') return value ? 'Sim' : 'Não';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

function downloadFile(content: string | Blob, filename: string, mimeType: string) {
  const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function generateFilename(base: string, format: ExportFormat, includeTimestamp: boolean): string {
  const timestamp = includeTimestamp
    ? '_' + new Date().toISOString().slice(0, 10).replace(/-/g, '')
    : '';
  const ext = format === 'excel' ? 'xlsx' : format;
  return (base + timestamp + '.' + ext).replace(/\s+/g, '_');
}

// ============================================================
// MAIN HOOK
// ============================================================

export function useExport<T extends Record<string, unknown>>(): UseExportResult<T> {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // ============================================================
  // EXPORT CSV
  // ============================================================

  const exportCSV = useCallback((data: T[], options: ExportOptions<T> = {}) => {
    const { filename = 'export', columns, includeTimestamp = true } = options;

    try {
      setIsExporting(true);
      setError(null);

      // Auto-detect columns if not provided
      const cols = columns ?? (data.length > 0
        ? Object.keys(data[0]).map((key) => ({
            key,
            header: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' '),
          }))
        : []);

      // Build CSV content
      const headers = cols.map((c) => '"' + c.header.replace(/"/g, '""') + '"').join(',');
      const rows = data.map((row) =>
        cols
          .map((col) => {
            const value = getNestedValue(row, col.key as string);
            const formatted = col.formatter
              ? col.formatter(value, row)
              : formatValue(value);
            return '"' + formatted.replace(/"/g, '""') + '"';
          })
          .join(',')
      );

      const csv = [headers, ...rows].join('\n');
      const bom = '\uFEFF'; // UTF-8 BOM for Excel compatibility

      downloadFile(
        bom + csv,
        generateFilename(filename, 'csv', includeTimestamp),
        'text/csv;charset=utf-8'
      );

      toast.success('Exportado com sucesso!');
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erro ao exportar');
      setError(error);
      toast.error('Erro ao exportar CSV');
    } finally {
      setIsExporting(false);
    }
  }, []);

  // ============================================================
  // EXPORT EXCEL
  // ============================================================

  const exportExcel = useCallback(async (data: T[], options: ExportOptions<T> = {}) => {
    const { filename = 'export', columns, title, includeTimestamp = true } = options;

    try {
      setIsExporting(true);
      setError(null);

      // Dynamic import of xlsx
      const XLSX = await import('xlsx').catch(() => {
        // Fallback to CDN
        return new Promise<typeof import('xlsx')>((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
          script.onload = () => resolve((window as unknown as { XLSX: typeof import('xlsx') }).XLSX);
          script.onerror = reject;
          document.head.appendChild(script);
        });
      });

      // Auto-detect columns
      const cols = columns ?? (data.length > 0
        ? Object.keys(data[0]).map((key) => ({
            key,
            header: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' '),
          }))
        : []);

      // Prepare data for worksheet
      const wsData = [
        ...(title ? [[title]] : []),
        cols.map((c) => c.header),
        ...data.map((row) =>
          cols.map((col) => {
            const value = getNestedValue(row, col.key as string);
            return col.formatter ? col.formatter(value, row) : formatValue(value);
          })
        ),
      ];

      // Create worksheet and workbook
      const ws = XLSX.utils.aoa_to_sheet(wsData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Dados');

      // Generate file
      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([wbout], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      downloadFile(blob, generateFilename(filename, 'excel', includeTimestamp), '');
      toast.success('Exportado com sucesso!');
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erro ao exportar');
      setError(error);
      toast.error('Erro ao exportar Excel');
    } finally {
      setIsExporting(false);
    }
  }, []);

  // ============================================================
  // EXPORT PDF
  // ============================================================

  const exportPDF = useCallback(async (data: T[], options: ExportOptions<T> = {}) => {
    const { filename = 'export', columns, title, subtitle, includeTimestamp = true } = options;

    try {
      setIsExporting(true);
      setError(null);

      // Dynamic import of jspdf and autotable
      const [{ jsPDF }, { default: autoTable }] = await Promise.all([
        import('jspdf' as string),
        import('jspdf-autotable' as string),
      ]);

      // Auto-detect columns
      const cols = columns ?? (data.length > 0
        ? Object.keys(data[0]).map((key) => ({
            key,
            header: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' '),
          }))
        : []);

      // Create PDF
      const doc = new jsPDF();
      let yPosition = 15;

      // Title
      if (title) {
        doc.setFontSize(16);
        doc.text(title, 14, yPosition);
        yPosition += 10;
      }

      // Subtitle
      if (subtitle) {
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(subtitle, 14, yPosition);
        yPosition += 10;
      }

      // Table
      autoTable(doc, {
        startY: yPosition,
        head: [cols.map((c) => c.header)],
        body: data.map((row) =>
          cols.map((col) => {
            const value = getNestedValue(row, col.key as string);
            return col.formatter ? col.formatter(value, row) : formatValue(value);
          })
        ),
        styles: { fontSize: 8 },
        headStyles: { fillColor: [41, 128, 185] },
      });

      // Footer
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(
          'Página ' + i + ' de ' + pageCount + ' | Gerado em ' + new Date().toLocaleString('pt-BR'),
          14,
          doc.internal.pageSize.height - 10
        );
      }

      doc.save(generateFilename(filename, 'pdf', includeTimestamp));
      toast.success('Exportado com sucesso!');
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erro ao exportar');
      setError(error);
      toast.error('Erro ao exportar PDF');
    } finally {
      setIsExporting(false);
    }
  }, []);

  // ============================================================
  // EXPORT JSON
  // ============================================================

  const exportJSON = useCallback((data: T[], options: ExportOptions<T> = {}) => {
    const { filename = 'export', includeTimestamp = true } = options;

    try {
      setIsExporting(true);
      setError(null);

      const json = JSON.stringify(data, null, 2);
      downloadFile(
        json,
        generateFilename(filename, 'json', includeTimestamp),
        'application/json'
      );

      toast.success('Exportado com sucesso!');
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erro ao exportar');
      setError(error);
      toast.error('Erro ao exportar JSON');
    } finally {
      setIsExporting(false);
    }
  }, []);

  // ============================================================
  // RETURN
  // ============================================================

  return {
    exportCSV,
    exportExcel,
    exportPDF,
    exportJSON,
    isExporting,
    error,
  };
}

export default useExport;
