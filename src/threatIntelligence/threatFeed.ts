export interface ThreatIndicator { id: string; type: 'ip' | 'domain' | 'hash' | 'url' | 'email'; value: string; severity: 'low' | 'medium' | 'high' | 'critical'; source: string; firstSeen: Date; lastSeen: Date; tags: string[]; }
export class ThreatFeed {
  private indicators = new Map<string, ThreatIndicator>();
  add(indicator: ThreatIndicator): void { this.indicators.set(indicator.id, indicator); }
  lookup(type: ThreatIndicator['type'], value: string): ThreatIndicator | undefined { return Array.from(this.indicators.values()).find(i => i.type === type && i.value === value); }
  getByType(type: ThreatIndicator['type']): ThreatIndicator[] { return Array.from(this.indicators.values()).filter(i => i.type === type); }
  getBySeverity(severity: ThreatIndicator['severity']): ThreatIndicator[] { return Array.from(this.indicators.values()).filter(i => i.severity === severity); }
  async sync(feedUrl: string): Promise<number> { console.log('Syncing from ' + feedUrl); return 0; }
}
export const threatFeed = new ThreatFeed();
