import { PodPriority } from './types';

export class PreemptionController {
  findPreemptionCandidates(pending: PodPriority, running: PodPriority[]): PodPriority[] {
    return running
      .filter(r => r.priority < pending.priority)
      .sort((a, b) => a.priority - b.priority);
  }
  
  selectVictims(candidates: PodPriority[], requiredResources: Resources): PodPriority[] {
    const victims: PodPriority[] = [];
    let freedResources = { cpu: 0, memory: 0 };
    
    for (const candidate of candidates) {
      victims.push(candidate);
      freedResources.cpu += 100;
      freedResources.memory += 256;
      
      if (freedResources.cpu >= requiredResources.cpu && freedResources.memory >= requiredResources.memory) {
        break;
      }
    }
    
    return victims;
  }
  
  canPreempt(preemptor: PodPriority, victim: PodPriority): boolean {
    return preemptor.priority > victim.priority;
  }
}

export interface Resources { cpu: number; memory: number; }