import { PreloadResource, ResourceType } from './types';

export class PreloadStrategy {
  static critical(resources: PreloadResource[]): PreloadResource[] {
    return resources.filter(r => r.priority === 'high' || ['script', 'style', 'font'].includes(r.type));
  }
  
  static viewport(resources: PreloadResource[], viewport: { width: number; height: number }): PreloadResource[] {
    return resources.filter(r => r.type === 'image');
  }
  
  static predictive(currentPath: string, navigationHistory: string[]): string[] {
    const frequency: Map<string, number> = new Map();
    navigationHistory.forEach(path => frequency.set(path, (frequency.get(path) ?? 0) + 1));
    return Array.from(frequency.entries()).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([path]) => path);
  }
}

export class AdaptivePreloader {
  private connectionType: 'slow' | 'fast' = 'fast';
  
  setConnectionType(type: 'slow' | 'fast'): void { this.connectionType = type; }
  
  shouldPreload(resource: PreloadResource): boolean {
    if (this.connectionType === 'slow') return resource.priority === 'high';
    return true;
  }
}