export const dateConverter = {
  toISO: (date: Date): string => date.toISOString(),
  fromISO: (iso: string): Date => new Date(iso),
  toTimestamp: (date: Date): number => Math.floor(date.getTime() / 1000),
  fromTimestamp: (ts: number): Date => new Date(ts * 1000),
  toDateString: (date: Date): string => date.toISOString().split('T')[0],
  toTimeString: (date: Date): string => date.toTimeString().split(' ')[0],
  toBrazilianFormat: (date: Date): string => date.toLocaleDateString('pt-BR'),
  fromBrazilianFormat: (str: string): Date => { const [d, m, y] = str.split('/').map(Number); return new Date(y, m - 1, d); },
};
