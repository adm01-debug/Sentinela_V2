import { Taint, Toleration } from './types';

export class TolerationMatcher {
  tolerates(toleration: Toleration, taint: Taint): boolean {
    if (toleration.key && toleration.key !== taint.key) return false;
    if (toleration.effect && toleration.effect !== taint.effect) return false;
    
    if (toleration.operator === 'Exists') return true;
    return toleration.value === taint.value;
  }
  
  toleratesAll(tolerations: Toleration[], taints: Taint[]): boolean {
    for (const taint of taints) {
      if (taint.effect === 'PreferNoSchedule') continue;
      const tolerated = tolerations.some(t => this.tolerates(t, taint));
      if (!tolerated) return false;
    }
    return true;
  }
  
  getUntoleratedTaints(tolerations: Toleration[], taints: Taint[]): Taint[] {
    return taints.filter(taint => !tolerations.some(t => this.tolerates(t, taint)));
  }
}