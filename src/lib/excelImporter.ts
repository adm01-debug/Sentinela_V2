// ============================================================
// EXCEL IMPORTER
// Importação de arquivos Excel (XLSX/XLS) com validação Zod
// Usa SheetJS (xlsx) - disponível via CDN no Lovable
// ============================================================

import { z } from 'zod';
import type { ImportResult, ImportError } from './csvImporter';

// Re-export types
export type { ImportResult, ImportError };

// ============================================================
// TYPES
// ============================================================

export interface ExcelImportOptions {
  sheetName?: string;
  sheetIndex?: number;
  headerRow?: number;
  startRow?: number;
  maxRows?: number;
  trimValues?: boolean;
}

export interface SheetInfo {
  name: string;
  rowCount: number;
  columnCount: number;
}

// ============================================================
// DYNAMIC XLSX LOADER
// ============================================================

let XLSX: typeof import('xlsx') | null = null;

async function loadXLSX(): Promise<typeof import('xlsx')> {
  if (XLSX) return XLSX;

  try {
    // Tentar import dinâmico
    XLSX = await import('xlsx');
    return XLSX;
  } catch {
    // Fallback para CDN
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
      script.onload = () => {
        XLSX = (window as unknown as { XLSX: typeof import('xlsx') }).XLSX;
        resolve(XLSX);
      };
      script.onerror = () => reject(new Error('Falha ao carregar biblioteca XLSX'));
      document.head.appendChild(script);
    });
  }
}

// ============================================================
// MAIN IMPORT FUNCTION
// ============================================================

export async function importExcel<T>(
  file: File,
  schema: z.ZodSchema<T>,
  options: ExcelImportOptions = {}
): Promise<ImportResult<T>> {
  const startTime = performance.now();
  const xlsx = await loadXLSX();

  const {
    sheetName,
    sheetIndex = 0,
    headerRow = 1,
    startRow = 2,
    maxRows,
    trimValues = true,
  } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = xlsx.read(data, { type: 'array', cellDates: true });

        // Selecionar sheet
        const selectedSheet = sheetName
          ? workbook.Sheets[sheetName]
          : workbook.Sheets[workbook.SheetNames[sheetIndex]];

        if (!selectedSheet) {
          throw new Error(`Sheet "${sheetName ?? sheetIndex}" não encontrada`);
        }

        // Converter para JSON
        const jsonData: Record<string, unknown>[] = xlsx.utils.sheet_to_json(selectedSheet, {
          header: headerRow,
          range: startRow - 1,
          raw: false,
          defval: '',
        });

        // Limitar linhas se necessário
        const rows = maxRows ? jsonData.slice(0, maxRows) : jsonData;

        const success: T[] = [];
        const errors: ImportError[] = [];

        rows.forEach((row, index) => {
          try {
            // Processar valores
            const processedRow = processExcelRow(row, trimValues);
            const validated = schema.parse(processedRow);
            success.push(validated);
          } catch (error) {
            if (error instanceof z.ZodError) {
              error.errors.forEach((err) => {
                errors.push({
                  row: index + startRow,
                  field: err.path.join('.'),
                  value: row[err.path[0] as string],
                  error: err.message,
                });
              });
            } else {
              errors.push({
                row: index + startRow,
                field: 'unknown',
                value: null,
                error: String(error),
              });
            }
          }
        });

        const duration = performance.now() - startTime;

        resolve({
          success,
          errors,
          total: rows.length,
          validCount: success.length,
          errorCount: errors.length,
          duration,
        });
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(new Error('Erro ao ler arquivo Excel'));
    reader.readAsArrayBuffer(file);
  });
}

// ============================================================
// ROW PROCESSING
// ============================================================

function processExcelRow(
  row: Record<string, unknown>,
  trimValues: boolean
): Record<string, unknown> {
  const processed: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(row)) {
    const cleanKey = trimValues ? key.trim() : key;

    if (value === null || value === undefined || value === '') {
      processed[cleanKey] = undefined;
    } else if (typeof value === 'string') {
      processed[cleanKey] = trimValues ? value.trim() : value;
    } else if (value instanceof Date) {
      processed[cleanKey] = value.toISOString().split('T')[0];
    } else {
      processed[cleanKey] = value;
    }
  }

  return processed;
}

// ============================================================
// SHEET INFO
// ============================================================

export async function getExcelSheets(file: File): Promise<SheetInfo[]> {
  const xlsx = await loadXLSX();

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = xlsx.read(data, { type: 'array' });

        const sheets: SheetInfo[] = workbook.SheetNames.map((name) => {
          const sheet = workbook.Sheets[name];
          const range = xlsx.utils.decode_range(sheet['!ref'] ?? 'A1');

          return {
            name,
            rowCount: range.e.r - range.s.r + 1,
            columnCount: range.e.c - range.s.c + 1,
          };
        });

        resolve(sheets);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(new Error('Erro ao ler arquivo Excel'));
    reader.readAsArrayBuffer(file);
  });
}

// ============================================================
// TEMPLATE GENERATOR
// ============================================================

export async function generateExcelTemplate<T extends z.ZodRawShape>(
  schema: z.ZodObject<T>,
  filename: string = 'template.xlsx'
): Promise<Blob> {
  const xlsx = await loadXLSX();

  const shape = schema.shape;
  const headers = Object.keys(shape);

  // Criar worksheet com headers
  const ws = xlsx.utils.aoa_to_sheet([headers]);

  // Criar workbook
  const wb = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(wb, ws, 'Template');

  // Gerar blob
  const wbout = xlsx.write(wb, { bookType: 'xlsx', type: 'array' });
  return new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}

export async function downloadExcelTemplate<T extends z.ZodRawShape>(
  schema: z.ZodObject<T>,
  filename: string = 'template.xlsx'
): Promise<void> {
  const blob = await generateExcelTemplate(schema, filename);
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

// ============================================================
// VALIDATION
// ============================================================

export async function validateExcelHeaders(
  file: File,
  requiredHeaders: string[],
  options: Pick<ExcelImportOptions, 'sheetName' | 'sheetIndex'> = {}
): Promise<{ valid: boolean; missing: string[]; extra: string[] }> {
  const xlsx = await loadXLSX();

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = xlsx.read(data, { type: 'array' });

        const sheet = options.sheetName
          ? workbook.Sheets[options.sheetName]
          : workbook.Sheets[workbook.SheetNames[options.sheetIndex ?? 0]];

        // Pegar primeira linha como headers
        const range = xlsx.utils.decode_range(sheet['!ref'] ?? 'A1');
        const headers: string[] = [];

        for (let col = range.s.c; col <= range.e.c; col++) {
          const cell = sheet[xlsx.utils.encode_cell({ r: 0, c: col })];
          if (cell?.v) {
            headers.push(String(cell.v).toLowerCase().trim());
          }
        }

        const normalizedRequired = requiredHeaders.map((h) => h.toLowerCase().trim());

        const missing = normalizedRequired.filter((h) => !headers.includes(h));
        const extra = headers.filter((h) => !normalizedRequired.includes(h));

        resolve({
          valid: missing.length === 0,
          missing,
          extra,
        });
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
    reader.readAsArrayBuffer(file);
  });
}

export default importExcel;
