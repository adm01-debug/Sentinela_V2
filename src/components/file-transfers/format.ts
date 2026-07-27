/** Formatação compartilhada dos painéis de transferência de arquivos. */

export function formatBytes(bytes: number): string {
  const value = Number(bytes ?? 0);
  if (value <= 0) return '0 B';
  if (value < 1024) return `${value} B`;
  const kb = value / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  if (mb < 1024) return `${mb.toFixed(1)} MB`;
  return `${(mb / 1024).toFixed(2)} GB`;
}

export function formatDay(day: string): string {
  const [, month, date] = day.split('-');
  return `${date}/${month}`;
}
