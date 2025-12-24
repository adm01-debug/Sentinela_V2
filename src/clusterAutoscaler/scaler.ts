import { NodeGroup, ScaleUpDecision, ScaleDownCandidate } from './types';

export class ClusterAutoscaler {
  private nodeGroups: Map<string, NodeGroup> = new Map();
  private unschedulablePods: string[] = [];
  
  registerNodeGroup(ng: NodeGroup): void { this.nodeGroups.set(ng.name, ng); }
  
  reportUnschedulable(podName: string): void { this.unschedulablePods.push(podName); }
  
  evaluateScaleUp(): ScaleUpDecision | null {
    if (this.unschedulablePods.length === 0) return null;
    
    for (const ng of this.nodeGroups.values()) {
      if (ng.currentSize < ng.maxSize) {
        return { nodeGroup: ng.name, increment: 1, reason: 'Unschedulable pods: ' + this.unschedulablePods.length };
      }
    }
    return null;
  }
  
  evaluateScaleDown(nodeUtilization: Map<string, number>, threshold: number = 0.5): ScaleDownCandidate[] {
    const candidates: ScaleDownCandidate[] = [];
    
    nodeUtilization.forEach((utilization, nodeName) => {
      if (utilization < threshold) {
        candidates.push({ nodeName, reason: 'Low utilization: ' + (utilization * 100).toFixed(1) + '%', podsToEvict: [] });
      }
    });
    
    return candidates;
  }
  
  scaleUp(nodeGroup: string): boolean {
    const ng = this.nodeGroups.get(nodeGroup);
    if (!ng || ng.currentSize >= ng.maxSize) return false;
    ng.currentSize++;
    this.unschedulablePods = [];
    return true;
  }
  
  scaleDown(nodeGroup: string): boolean {
    const ng = this.nodeGroups.get(nodeGroup);
    if (!ng || ng.currentSize <= ng.minSize) return false;
    ng.currentSize--;
    return true;
  }
}