import os from 'os';

export function getMemoryUsage() {
  const total = os.totalmem();
  const free = os.freemem();
  return { total, free, used: total - free, percentage: ((total - free) / total) * 100 };
}