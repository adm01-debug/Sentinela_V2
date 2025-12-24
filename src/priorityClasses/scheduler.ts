import { PodPriority } from './types';

export class PriorityScheduler {
  private queue: PodPriority[] = [];
  
  enqueue(pod: PodPriority): void {
    this.queue.push(pod);
    this.queue.sort((a, b) => b.priority - a.priority);
  }
  
  dequeue(): PodPriority | undefined { return this.queue.shift(); }
  peek(): PodPriority | undefined { return this.queue[0]; }
  
  getQueuePosition(podName: string, namespace: string): number {
    return this.queue.findIndex(p => p.podName === podName && p.namespace === namespace);
  }
  
  removeFromQueue(podName: string, namespace: string): boolean {
    const index = this.getQueuePosition(podName, namespace);
    if (index >= 0) { this.queue.splice(index, 1); return true; }
    return false;
  }
  
  getQueueStats(): QueueStats {
    const byPriority: Map<number, number> = new Map();
    this.queue.forEach(p => byPriority.set(p.priority, (byPriority.get(p.priority) ?? 0) + 1));
    return { total: this.queue.length, byPriority: Object.fromEntries(byPriority) };
  }
}

export interface QueueStats { total: number; byPriority: Record<number, number>; }