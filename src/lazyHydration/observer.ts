import { HydrationTarget } from './types';
import { LazyHydrator } from './hydrator';

export class HydrationObserver {
  private observed: Set<string> = new Set();
  
  constructor(private hydrator: LazyHydrator, private rootMargin: string = '0px', private threshold: number = 0.1) {}
  
  observe(target: HydrationTarget): void {
    if (this.observed.has(target.id)) return;
    this.observed.add(target.id);
    
    // Simulate intersection observer behavior
    setTimeout(() => {
      if (Math.random() > 0.5) this.hydrator.hydrate(target.id);
    }, 200);
  }
  
  unobserve(id: string): void { this.observed.delete(id); }
  disconnect(): void { this.observed.clear(); }
}

export class IdleObserver {
  private callbacks: (() => void)[] = [];
  
  requestIdleCallback(callback: () => void): void {
    this.callbacks.push(callback);
    setTimeout(() => {
      const cb = this.callbacks.shift();
      if (cb) cb();
    }, 50);
  }
  
  cancelIdleCallback(): void { this.callbacks = []; }
}