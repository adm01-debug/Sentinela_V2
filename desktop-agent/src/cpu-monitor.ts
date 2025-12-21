import * as os from 'os';

export function getCpuUsage(): number {
  const cpus = os.cpus();
  let totalIdle = 0, totalTick = 0;
  cpus.forEach(cpu => { for (const type in cpu.times) { totalTick += (cpu.times as any)[type]; } totalIdle += cpu.times.idle; });
  return Math.round((1 - totalIdle / totalTick) * 100);
}