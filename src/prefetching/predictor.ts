export class NavigationPredictor {
  private history: string[] = [];
  private transitions: Map<string, Map<string, number>> = new Map();
  
  recordNavigation(from: string, to: string): void {
    this.history.push(to);
    if (!this.transitions.has(from)) this.transitions.set(from, new Map());
    const fromMap = this.transitions.get(from)!;
    fromMap.set(to, (fromMap.get(to) ?? 0) + 1);
  }
  
  predict(currentPath: string, count: number = 3): string[] {
    const fromMap = this.transitions.get(currentPath);
    if (!fromMap) return [];
    return Array.from(fromMap.entries()).sort((a, b) => b[1] - a[1]).slice(0, count).map(([path]) => path);
  }
  
  getProbability(from: string, to: string): number {
    const fromMap = this.transitions.get(from);
    if (!fromMap) return 0;
    const total = Array.from(fromMap.values()).reduce((sum, n) => sum + n, 0);
    return total ? (fromMap.get(to) ?? 0) / total : 0;
  }
}

export class HoverPredictor {
  private hoverTimes: Map<string, number> = new Map();
  private threshold: number;
  
  constructor(thresholdMs: number = 100) { this.threshold = thresholdMs; }
  
  startHover(url: string): void { this.hoverTimes.set(url, Date.now()); }
  
  endHover(url: string): boolean {
    const start = this.hoverTimes.get(url);
    this.hoverTimes.delete(url);
    return start ? Date.now() - start >= this.threshold : false;
  }
}