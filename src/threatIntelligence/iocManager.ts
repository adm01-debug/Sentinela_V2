import { ThreatIndicator } from './threatFeed';
export interface IOC { id: string; indicator: ThreatIndicator; context: string; confidence: number; expiresAt?: Date; }
export class IOCManager {
  private iocs = new Map<string, IOC>();
  add(indicator: ThreatIndicator, context: string, confidence: number, expiresAt?: Date): IOC { const ioc: IOC = { id: crypto.randomUUID(), indicator, context, confidence, expiresAt }; this.iocs.set(ioc.id, ioc); return ioc; }
  check(value: string): IOC | undefined { return Array.from(this.iocs.values()).find(i => i.indicator.value === value); }
  getActive(): IOC[] { const now = new Date(); return Array.from(this.iocs.values()).filter(i => !i.expiresAt || i.expiresAt > now); }
  remove(id: string): boolean { return this.iocs.delete(id); }
  cleanup(): number { const now = new Date(); const expired = Array.from(this.iocs.values()).filter(i => i.expiresAt && i.expiresAt <= now); expired.forEach(i => this.iocs.delete(i.id)); return expired.length; }
}
export const iocManager = new IOCManager();
