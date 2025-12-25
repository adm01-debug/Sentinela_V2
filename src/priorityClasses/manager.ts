/**
 * @fileoverview Priority classes manager
 * @module @sentinela/core/priorityClasses
 * @version 13.0.0
 */

import { PriorityClass } from './types';

export class PriorityClassManager {
  private classes: Map<string, PriorityClass> = new Map();
  private defaultClass?: string;
  
  create(pc: PriorityClass): void {
    this.classes.set(pc.name, pc);
    if (pc.globalDefault) this.defaultClass = pc.name;
  }
  
  delete(name: string): boolean {
    if (this.defaultClass === name) this.defaultClass = undefined;
    return this.classes.delete(name);
  }
  
  get(name: string): PriorityClass | undefined { return this.classes.get(name); }
  getDefault(): PriorityClass | undefined { return this.defaultClass ? this.classes.get(this.defaultClass) : undefined; }
  list(): PriorityClass[] { return Array.from(this.classes.values()).sort((a, b) => b.value - a.value); }
  
  getPriority(className?: string): number {
    if (className) {
      const pc = this.classes.get(className);
      return pc?.value ?? 0;
    }
    return this.getDefault()?.value ?? 0;
  }
}