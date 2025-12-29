import * as os from 'os';
import { EventEmitter } from 'events';

interface CpuTimes {
  user: number;
  nice: number;
  sys: number;
  idle: number;
  irq: number;
}

interface CpuInfo {
  model: string;
  speed: number;
  times: CpuTimes;
}

interface CpuUsage {
  percentage: number;
  perCore: number[];
  timestamp: Date;
}

interface CpuMonitorConfig {
  interval: number;
  highUsageThreshold: number;
}

class CpuMonitor extends EventEmitter {
  private config: CpuMonitorConfig;
  private previousCpus: CpuInfo[] = [];
  private monitorInterval: NodeJS.Timeout | null = null;
  private isMonitoring = false;

  constructor(config?: Partial<CpuMonitorConfig>) {
    super();
    this.config = {
      interval: 5000, // 5 seconds
      highUsageThreshold: 80,
      ...config,
    };
  }

  start(): void {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    this.previousCpus = os.cpus();
    
    this.monitorInterval = setInterval(() => {
      const usage = this.calculateUsage();
      this.emit('usage', usage);
      
      if (usage.percentage > this.config.highUsageThreshold) {
        this.emit('high-usage', usage);
      }
    }, this.config.interval);

    this.emit('started');
  }

  stop(): void {
    if (!this.isMonitoring) return;
    
    this.isMonitoring = false;
    
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
      this.monitorInterval = null;
    }
    
    this.emit('stopped');
  }

  private calculateUsage(): CpuUsage {
    const currentCpus = os.cpus();
    const perCore: number[] = [];
    let totalIdle = 0;
    let totalTick = 0;

    for (let i = 0; i < currentCpus.length; i++) {
      const current = currentCpus[i];
      const previous = this.previousCpus[i];

      const currentTotal = this.getTotalTicks(current.times);
      const previousTotal = this.getTotalTicks(previous.times);
      
      const idleDiff = current.times.idle - previous.times.idle;
      const totalDiff = currentTotal - previousTotal;

      const coreUsage = totalDiff > 0 
        ? Math.round((1 - idleDiff / totalDiff) * 100) 
        : 0;
      
      perCore.push(coreUsage);
      totalIdle += idleDiff;
      totalTick += totalDiff;
    }

    this.previousCpus = currentCpus;

    const percentage = totalTick > 0 
      ? Math.round((1 - totalIdle / totalTick) * 100) 
      : 0;

    return {
      percentage,
      perCore,
      timestamp: new Date(),
    };
  }

  private getTotalTicks(times: CpuTimes): number {
    return times.user + times.nice + times.sys + times.idle + times.irq;
  }

  getCurrentUsage(): CpuUsage {
    return this.calculateUsage();
  }

  getCoreCount(): number {
    return os.cpus().length;
  }

  getLoadAverage(): number[] {
    return os.loadavg();
  }
}

export const cpuMonitor = new CpuMonitor();
export type { CpuUsage, CpuMonitorConfig, CpuInfo };
