export class CsvProcessor {
  parse<T>(csv: string, hasHeader = true): T[] { const lines = csv.trim().split('\n'); const headers = hasHeader ? lines[0].split(',').map(h => h.trim()) : []; const dataLines = hasHeader ? lines.slice(1) : lines; return dataLines.map(line => { const values = line.split(',').map(v => v.trim()); if (hasHeader) { const obj: any = {}; headers.forEach((h, i) => obj[h] = values[i]); return obj; } return values as any; }); }
  stringify<T extends object>(data: T[], includeHeader = true): string { if (data.length === 0) return ''; const headers = Object.keys(data[0]); const lines: string[] = []; if (includeHeader) lines.push(headers.join(',')); data.forEach(row => lines.push(headers.map(h => String((row as any)[h] ?? '')).join(','))); return lines.join('\n'); }
}
export const csvProcessor = new CsvProcessor();
