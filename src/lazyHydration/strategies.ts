import { HydrationStrategy, HydrationTarget } from './types';
import { LazyHydrator } from './hydrator';

export class HydrationStrategyHandler {
  constructor(private hydrator: LazyHydrator) {}
  
  apply(target: HydrationTarget): void {
    switch (target.strategy) {
      case 'visible': this.onVisible(target); break;
      case 'idle': this.onIdle(target); break;
      case 'interaction': this.onInteraction(target); break;
      case 'media': this.onMedia(target); break;
    }
  }
  
  private onVisible(target: HydrationTarget): void {
    setTimeout(() => this.hydrator.hydrate(target.id), 100);
  }
  
  private onIdle(target: HydrationTarget): void {
    setTimeout(() => this.hydrator.hydrate(target.id), 0);
  }
  
  private onInteraction(target: HydrationTarget): void {
    // Would attach event listeners
  }
  
  private onMedia(target: HydrationTarget): void {
    // Would check media query
  }
}

export class ProgressiveHydration {
  private priority: Map<string, number> = new Map();
  
  setPriority(id: string, priority: number): void { this.priority.set(id, priority); }
  
  getOrder(ids: string[]): string[] {
    return ids.sort((a, b) => (this.priority.get(b) ?? 0) - (this.priority.get(a) ?? 0));
  }
}