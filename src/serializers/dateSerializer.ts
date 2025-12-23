export const dateSerializer = {
  toISO: (date: Date): string => date.toISOString(),
  fromISO: (iso: string): Date => new Date(iso),
  toTimestamp: (date: Date): number => date.getTime(),
  fromTimestamp: (ts: number): Date => new Date(ts),
  toDateString: (date: Date): string => date.toISOString().split('T')[0],
  toTimeString: (date: Date): string => date.toISOString().split('T')[1].split('.')[0],
  serializeRange: (start: Date, end: Date) => ({ start: start.toISOString(), end: end.toISOString() }),
  deserializeRange: (range: { start: string; end: string }) => ({ start: new Date(range.start), end: new Date(range.end) }),
};
