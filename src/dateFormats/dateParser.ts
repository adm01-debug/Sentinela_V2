export class DateParser {
  parse(dateStr: string): Date | null { const date = new Date(dateStr); return isNaN(date.getTime()) ? null : date; }
  parseBR(dateStr: string): Date | null { const parts = dateStr.split('/'); if (parts.length !== 3) return null; const [day, month, year] = parts.map(Number); return new Date(year, month - 1, day); }
  parseUS(dateStr: string): Date | null { const parts = dateStr.split('/'); if (parts.length !== 3) return null; const [month, day, year] = parts.map(Number); return new Date(year, month - 1, day); }
  parseISO(dateStr: string): Date | null { return this.parse(dateStr); }
}
export const dateParser = new DateParser();
