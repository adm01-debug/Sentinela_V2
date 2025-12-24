import { Container, Service } from './types';
import { v4 as uuidv4 } from 'uuid';

export class ContainerScheduler {
  private nodes: Node[] = [];
  private placements: Map<string, string> = new Map();
  
  addNode(node: Node): void { this.nodes.push(node); }
  
  schedule(container: Container): ScheduleResult {
    const suitable = this.nodes.filter(n => this.canFit(n, container));
    if (suitable.length === 0) return { success: false, reason: 'No suitable node' };
    
    const node = suitable.reduce((best, n) => this.score(n) > this.score(best) ? n : best);
    this.placements.set(container.id, node.id);
    return { success: true, nodeId: node.id };
  }
  
  private canFit(node: Node, container: Container): boolean {
    return node.available.cpu >= parseInt(container.resources.cpu) && node.available.memory >= parseInt(container.resources.memory);
  }
  
  private score(node: Node): number {
    return node.available.cpu + node.available.memory / 1024;
  }
  
  getPlacement(containerId: string): string | undefined { return this.placements.get(containerId); }
}

export interface Node { id: string; name: string; available: { cpu: number; memory: number }; labels: Record<string, string>; }
export interface ScheduleResult { success: boolean; nodeId?: string; reason?: string; }