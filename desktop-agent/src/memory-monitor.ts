import * as os from 'os';

export function getMemoryUsage(): { total: number; used: number; free: number; percentage: number } {
  const total = os.totalmem();
  const free = os.freemem();
  const used = total - free;
  return { total, used, free, percentage: Math.round((used / total) * 100) };
}