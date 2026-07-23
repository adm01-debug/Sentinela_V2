import * as XLSX from 'xlsx';

export interface XlsxSheet<T extends Record<string, unknown>> {
  name: string;
  rows: T[];
  headers?: Array<keyof T | { key: keyof T; label: string }>;
}

/**
 * Exporta uma ou mais sheets para arquivo .xlsx e dispara download.
 * - Zero dependência backend
 * - Preserva ordem e labels de headers
 */
export function exportToXlsx<T extends Record<string, unknown>>(
  filename: string,
  sheets: XlsxSheet<T>[],
): void {
  const workbook = XLSX.utils.book_new();

  for (const sheet of sheets) {
    let sheetData: Record<string, unknown>[];
    if (sheet.headers && sheet.headers.length > 0) {
      sheetData = sheet.rows.map((row) => {
        const out: Record<string, unknown> = {};
        for (const h of sheet.headers!) {
          if (typeof h === 'object') {
            out[h.label] = row[h.key];
          } else {
            out[String(h)] = row[h];
          }
        }
        return out;
      });
    } else {
      sheetData = sheet.rows as Record<string, unknown>[];
    }
    const ws = XLSX.utils.json_to_sheet(sheetData);
    XLSX.utils.book_append_sheet(workbook, ws, sheet.name.slice(0, 31));
  }

  const final = filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`;
  XLSX.writeFile(workbook, final);
}

export function exportSimpleXlsx<T extends Record<string, unknown>>(
  filename: string,
  rows: T[],
  sheetName = 'Dados',
): void {
  exportToXlsx(filename, [{ name: sheetName, rows }]);
}
