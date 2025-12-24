export class ScalingAlgorithm {
  private stabilizationWindow: number;
  private history: { timestamp: Date; replicas: number }[] = [];
  
  constructor(stabilizationWindowSeconds: number = 300) { this.stabilizationWindow = stabilizationWindowSeconds * 1000; }
  
  calculate(currentReplicas: number, metrics: { current: number; target: number }[], minReplicas: number, maxReplicas: number): number {
    const ratios = metrics.map(m => m.current / m.target);
    const maxRatio = Math.max(...ratios);
    
    let desired = Math.ceil(currentReplicas * maxRatio);
    desired = Math.max(minReplicas, Math.min(maxReplicas, desired));
    
    return this.stabilize(desired);
  }
  
  private stabilize(proposed: number): number {
    const now = Date.now();
    this.history = this.history.filter(h => now - h.timestamp.getTime() < this.stabilizationWindow);
    this.history.push({ timestamp: new Date(), replicas: proposed });
    
    const recentMax = Math.max(...this.history.map(h => h.replicas));
    return Math.min(proposed, recentMax);
  }
  
  reset(): void { this.history = []; }
}