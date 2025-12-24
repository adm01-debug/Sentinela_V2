export interface CPUProfile { id: string; name: string; startTime: number; endTime: number; samples: { timestamp: number; usage: number }[]; }
export class CPUProfiler {
  private profiles: CPUProfile[] = [];
  private current: CPUProfile | null = null;
  start(name: string): void { this.current = { id: crypto.randomUUID(), name, startTime: performance.now(), endTime: 0, samples: [] }; }
  sample(): void { if (this.current) { this.current.samples.push({ timestamp: performance.now(), usage: Math.random() * 100 }); } }
  stop(): CPUProfile | null { if (this.current) { this.current.endTime = performance.now(); this.profiles.push(this.current); const result = this.current; this.current = null; return result; } return null; }
  getProfiles(): CPUProfile[] { return [...this.profiles]; }
}
export const cpuProfiler = new CPUProfiler();
