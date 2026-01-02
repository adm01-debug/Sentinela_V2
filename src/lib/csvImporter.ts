// ============================================================
// CSV IMPORTER
// Importação de arquivos CSV com validação Zod usando PapaParse
// ============================================================

import Papa from 'papaparse';
import { z } from 'zod';

// ============================================================
// TYPES
// ============================================================

export interface ImportResult<T> {
  success: T[];
  errors: ImportError[];
  total: number;
  validCount: number;
  errorCount: number;
  duration: number;
}

export interface ImportError {
  row: number;
  field: string;
  value: unknown;
  error: string;
}

export interface CSVImportOptions {
  delimiter?: string;
  skipFirstRow?: boolean;
  trimValues?: boolean;
  skipEmptyRows?: boolean;
  maxRows?: number;
  encoding?: string;
}

// ============================================================
// MAIN IMPORT FUNCTION
// ============================================================

export async function importCSV<T>(
  file: File,
  schema: z.ZodSchema<T>,
  options: CSVImportOptions = {}
): Promise<ImportResult<T>> {
  const startTime = performance.now();
  const { maxRows, trimValues = true } = options;

  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      delimiter: options.delimiter,
      encoding: options.encoding ?? 'UTF-8',
      transformHeader: (header) => (trimValues ? header.trim() : header),
      transform: (value) => (trimValues ? value.trim() : value),
      complete: (results) => {
        try {
          let rows = results.data as Record<string, string>[];
          
          // Limitar linhas se necessário
          if (maxRows && rows.length > maxRows) {
            rows = rows.slice(0, maxRows);
          }

          const success: T[] = [];
          const errors: ImportError[] = [];

          rows.forEach((row, index) => {
            try {
              // Processar valores (converter tipos)
              const processedRow = processRowValues(row);
              const validated = schema.parse(processedRow);
              success.push(validated);
            } catch (error) {
              if (error instanceof z.ZodError) {
                error.errors.forEach((err) => {
                  errors.push({
                    row: index + 2, // +2 porque linha 1 é header
                    field: err.path.join('.'),
                    value: row[err.path[0] as string],
                    error: err.message,
                  });
                });
              } else {
                errors.push({
                  row: index + 2,
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
      },
      error: (error) => {
        reject(new Error(`Erro ao processar CSV: ${error.message}`));
      },
    });
  });
}

// ============================================================
// VALUE PROCESSING
// ============================================================

function processRowValues(row: Record<string, string>): Record<string, unknown> {
  const processed: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(row)) {
    processed[key] = parseValue(value);
  }

  return processed;
}

function parseValue(value: string): unknown {
  // Empty string
  if (!value || value === '') return undefined;

  // Boolean
  const lowerValue = value.toLowerCase();
  if (lowerValue === 'true' || lowerValue === 'sim' || lowerValue === 'yes') return true;
  if (lowerValue === 'false' || lowerValue === 'não' || lowerValue === 'nao' || lowerValue === 'no') return false;

  // Number (Brazilian format support)
  const numValue = value.replace(',', '.');
  if (/^-?\d+(\.\d+)?$/.test(numValue)) {
    return parseFloat(numValue);
  }

  // Date (ISO format or Brazilian format)
  if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
    return value;
  }
  if (/^\d{2}\/\d{2}\/\d{4}/.test(value)) {
    const [day, month, year] = value.split('/');
    return `${year}-${month}-${day}`;
  }

  // String
  return value;
}

// ============================================================
// TEMPLATE GENERATOR
// ============================================================

export function generateCSVTemplate<T extends z.ZodRawShape>(
  schema: z.ZodObject<T>,
  options: { includeExample?: boolean; delimiter?: string } = {}
): string {
  const { includeExample = true, delimiter = ',' } = options;

  const shape = schema.shape;
  const headers = Object.keys(shape);
  const lines: string[] = [headers.join(delimiter)];

  if (includeExample) {
    const example = headers.map((key) => {
      const field = shape[key];
      return getExampleValue(field);
    });
    lines.push(example.join(delimiter));
  }

  return lines.join('\n');
}

function getExampleValue(field: z.ZodTypeAny): string {
  const typeName = field._def.typeName;

  switch (typeName) {
    case 'ZodString':
      return 'texto_exemplo';
    case 'ZodNumber':
      return '123.45';
    case 'ZodBoolean':
      return 'true';
    case 'ZodDate':
      return new Date().toISOString().split('T')[0];
    case 'ZodOptional':
      return getExampleValue(field._def.innerType);
    case 'ZodDefault':
      return String(field._def.defaultValue());
    default:
      return '';
  }
}

// ============================================================
// VALIDATION HELPERS
// ============================================================

export function validateCSVHeaders(
  file: File,
  requiredHeaders: string[]
): Promise<{ valid: boolean; missing: string[]; extra: string[] }> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      preview: 1, // Só primeira linha
      complete: (results) => {
        const headers = (results.data[0] as string[] ?? []).map((h) => h.toLowerCase().trim());
        const normalizedRequired = requiredHeaders.map((h) => h.toLowerCase().trim());

        const missing = normalizedRequired.filter((h) => !headers.includes(h));
        const extra = headers.filter((h) => !normalizedRequired.includes(h));

        resolve({
          valid: missing.length === 0,
          missing,
          extra,
        });
      },
      error: (error) => {
        reject(new Error(`Erro ao validar headers: ${error.message}`));
      },
    });
  });
}

// ============================================================
// FILE SIZE HELPERS
// ============================================================

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function estimateRowCount(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      complete: (results) => {
        resolve(Math.max(0, results.data.length - 1)); // -1 for header
      },
      error: (error) => {
        reject(new Error(`Erro ao contar linhas: ${error.message}`));
      },
    });
  });
}

// ============================================================
// EXPORT CSV
// ============================================================

export function exportToCSV<T extends Record<string, unknown>>(
  data: T[],
  filename: string = 'export.csv',
  options: { delimiter?: string; includeHeaders?: boolean } = {}
): void {
  const { delimiter = ',', includeHeaders = true } = options;

  const csv = Papa.unparse(data, {
    delimiter,
    header: includeHeaders,
  });

  // BOM para compatibilidade com Excel
  const bom = '\uFEFF';
  const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8' });
  
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default importCSV;
