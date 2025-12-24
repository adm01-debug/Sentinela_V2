import { haCluster } from './haCluster';
export class Quorum {
  getMinimum(): number { const total = haCluster.getNodes().length; return Math.floor(total / 2) + 1; }
  hasQuorum(): boolean { const healthy = haCluster.getNodes().filter(n => n.healthy).length; return healthy >= this.getMinimum(); }
  canElect(): boolean { return this.hasQuorum(); }
  getHealthyCount(): number { return haCluster.getNodes().filter(n => n.healthy).length; }
  getStatus(): { total: number; healthy: number; required: number; hasQuorum: boolean } { const total = haCluster.getNodes().length; const healthy = this.getHealthyCount(); return { total, healthy, required: this.getMinimum(), hasQuorum: this.hasQuorum() }; }
}
export const quorum = new Quorum();
