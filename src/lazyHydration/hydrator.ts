/**
 * @fileoverview Lazy hydrator
 * @module @sentinela/core/lazyHydration
 * @version 13.0.0
 */

import { HydrationConfig, HydrationTarget } from './types';

export class LazyHydrator {
  private targets: Map<string, HydrationTarget> = new Map();
  private hydrationCallbacks: Map<string, () => void> = new Map();
  
  register(target: HydrationTarget, callback: () => void): void {
    this.targets.set(target.id, target);
    this.hydrationCallbacks.set(target.id, callback);
  }
  
  hydrate(id: string): boolean {
    const target = this.targets.get(id);
    const callback = this.hydrationCallbacks.get(id);
    if (!target || !callback || target.hydrated) return false;
    
    callback();
    target.hydrated = true;
    return true;
  }
  
  hydrateAll(): number {
    let count = 0;
    for (const [id, target] of this.targets) {
      if (!target.hydrated && this.hydrate(id)) count++;
    }
    return count;
  }
  
  isHydrated(id: string): boolean { return this.targets.get(id)?.hydrated ?? false; }
  
  getStats(): { total: number; hydrated: number; pending: number } {
    const targets = Array.from(this.targets.values());
    const hydrated = targets.filter(t => t.hydrated).length;
    return { total: targets.length, hydrated, pending: targets.length - hydrated };
  }
}