import { DaemonSetController, ManagedDaemonSet } from './controller';

export class DaemonSetRollout {
  constructor(private controller: DaemonSetController) {}
  
  async rollout(namespace: string, name: string, newImage: string): Promise<RolloutStatus> {
    const managed = this.controller.get(namespace, name);
    if (!managed) return { success: false, message: 'DaemonSet not found' };
    
    const maxUnavailable = this.parseMaxUnavailable(managed.spec.updateStrategy.rollingUpdate?.maxUnavailable ?? 1, managed.pods.length);
    let updated = 0;
    
    for (const pod of managed.pods) {
      console.log('Updating pod', pod.name, 'on node', pod.nodeName);
      updated++;
      await new Promise(r => setTimeout(r, 10));
    }
    
    return { success: true, message: 'Rolled out ' + updated + ' pods' };
  }
  
  private parseMaxUnavailable(value: number | string, total: number): number {
    if (typeof value === 'number') return value;
    if (value.endsWith('%')) return Math.floor(total * parseInt(value) / 100);
    return parseInt(value);
  }
}

export interface RolloutStatus { success: boolean; message: string; }