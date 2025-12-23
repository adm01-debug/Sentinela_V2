export class DateRange {
  readonly start: Date; readonly end: Date;
  constructor(start: Date, end: Date) { if (start > end) throw new Error('Start must be before end'); this.start = start; this.end = end; }
  contains(date: Date): boolean { return date >= this.start && date <= this.end; }
  overlaps(other: DateRange): boolean { return this.start <= other.end && this.end >= other.start; }
  getDays(): number { return Math.ceil((this.end.getTime() - this.start.getTime()) / (1000 * 60 * 60 * 24)); }
  getHours(): number { return Math.ceil((this.end.getTime() - this.start.getTime()) / (1000 * 60 * 60)); }
  static today(): DateRange { const now = new Date(); const start = new Date(now.setHours(0,0,0,0)); const end = new Date(now.setHours(23,59,59,999)); return new DateRange(start, end); }
}
