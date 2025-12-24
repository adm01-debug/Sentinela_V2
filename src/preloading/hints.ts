import { PreloadResource, ResourceType } from './types';

export class ResourceHintGenerator {
  generatePreload(resource: PreloadResource): string {
    let hint = '<link rel="preload" href="' + resource.url + '" as="' + resource.type + '"';
    if (resource.crossOrigin) hint += ' crossorigin';
    hint += '>';
    return hint;
  }
  
  generatePrefetch(url: string): string { return '<link rel="prefetch" href="' + url + '">'; }
  generatePreconnect(origin: string): string { return '<link rel="preconnect" href="' + origin + '">'; }
  generateDnsPrefetch(origin: string): string { return '<link rel="dns-prefetch" href="' + origin + '">'; }
  
  generateAll(resources: PreloadResource[]): string[] {
    const origins = new Set(resources.map(r => new URL(r.url).origin));
    const hints: string[] = [];
    origins.forEach(o => hints.push(this.generatePreconnect(o)));
    resources.forEach(r => hints.push(this.generatePreload(r)));
    return hints;
  }
}