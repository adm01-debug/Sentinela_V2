// Heartbeat Manager
export class HeartbeatManager {
  private heartbeats: Map<string, Date> = new Map(); private interval?: NodeJS.Timeout;
  constructor(private timeout: number = 30000) {}
  start(checkInterval: number = 5000): void { this.interval = setInterval(() => this.checkAll(), checkInterval); }
  stop(): void { if (this.interval) clearInterval(this.interval); }
  beat(serviceId: string): void { this.heartbeats.set(serviceId, new Date()); }
  isAlive(serviceId: string): boolean { const last = this.heartbeats.get(serviceId); return last ? Date.now() - last.getTime() < this.timeout : false; }
  private checkAll(): void { for (const [id, time] of this.heartbeats) { if (Date.now() - time.getTime() > this.timeout) console.log("[Heartbeat] Service dead:", id); } }
}
