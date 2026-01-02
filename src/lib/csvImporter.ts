// ============================================================
// CSV IMPORTER
// Importação de arquivos CSV com validação Zod
// ============================================================

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
// CSV PARSER (sem dependência externa)
// ============================================================

function parseCSV(text: string, options: CSVImportOptions = {}): Record<string, string>[] {
  const { delimiter = ',', trimValues = true, skipEmptyRows = true, maxRows } = options;

  const lines = text.split(/\r?\n/);
  if (lines.length < 2) return [];

  // Primeira linha são os headers
  const headers = lines[0].split(delimiter).map((h) => (trimValues ? h.trim() : h));

  const results: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    if (maxRows && results.length >= maxRows) break;

    const line = lines[i];
    if (skipEmptyRows && !line.trim()) continue;

    const values = parseCSVLine(line, delimiter);
    const row: Record<string, string> = {};

    headers.forEach((header, index) => {
      const value = values[index] ?? '';
      row[header] = trimValues ? value.trim() : value;
    });

    results.push(row);
  }

  return results;
}

function parseCSVLine(line: string, delimiter: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++; // Skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current);
  return result;
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

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const rows = parseCSV(text, options);

        const success: T[] = [];
        const errors: ImportError[] = [];

        rows.forEach((row, index) => {
          try {
            // Tentar converter valores numéricos
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
    };

    reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
    reader.readAsText(file, options.encoding ?? 'UTF-8');
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
  if (value.toLowerCase() === 'true') return true;
  if (value.toLowerCase() === 'false') return false;
  if (value.toLowerCase() === 'sim') return true;
  if (value.toLowerCase() === 'não' || value.toLowerCase() === 'nao') return false;

  // Number
  const numValue = value.replace(',', '.'); // Brazilian format
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
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const firstLine = text.split(/\r?\n/)[0];
        const headers = firstLine.split(',').map((h) => h.trim().toLowerCase());

        const normalizedRequired = requiredHeaders.map((h) => h.toLowerCase());

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
    reader.readAsText(file);
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
    const reader = new FileReader();

    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split(/\r?\n/).filter((l) => l.trim());
      resolve(Math.max(0, lines.length - 1)); // -1 for header
    };

    reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
    reader.readAsText(file);
  });
}

export default importCSV;
