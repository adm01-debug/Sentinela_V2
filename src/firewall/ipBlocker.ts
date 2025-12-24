export class IPBlocker {
  private blocked = new Set<string>();
  private whitelist = new Set<string>();
  block(ip: string): void { this.blocked.add(ip); }
  unblock(ip: string): void { this.blocked.delete(ip); }
  whitelist_add(ip: string): void { this.whitelist.add(ip); }
  isBlocked(ip: string): boolean { if (this.whitelist.has(ip)) return false; return this.blocked.has(ip); }
  getBlocked(): string[] { return Array.from(this.blocked); }
  blockRange(cidr: string): void { this.blocked.add(cidr); }
}
export const ipBlocker = new IPBlocker();
